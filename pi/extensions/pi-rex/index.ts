import { SessionManager, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { stripVTControlCharacters } from "node:util";

// Fork the current Pi conversation into a new Rex split or tab.
//
// Everything else Rex-related lives elsewhere:
// - Task status in Rex tabs: built into Pi since 1.1 (OSC 7501, see Pi's docs/terminal-setup.md).
// - Teaching the model the rex CLI: the rex skill installed by `rex skill setup`.
// Do not add text to the system prompt here: returning systemPrompt from before_agent_start
// forces Pi to rewrite the start of every request, so any mid-session tool change misses the
// whole prompt cache.

type Placement = "split" | "tab";

function plainText(text: string): string {
  return stripVTControlCharacters(text).replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, "");
}

export default function rexForkExtension(pi: ExtensionAPI) {
  let sessionAbort = new AbortController();

  pi.on("session_start", () => {
    sessionAbort.abort();
    sessionAbort = new AbortController();
  });
  pi.on("session_shutdown", () => {
    sessionAbort.abort();
  });

  async function runRex(args: string[], ctx: ExtensionContext) {
    const signal = sessionAbort.signal;
    const result = await pi.exec("rex", args, { cwd: ctx.cwd, timeout: 5000, signal });
    signal.throwIfAborted();
    if (result.killed) throw new Error("Rex timed out. Check that its server is reachable.");
    if (result.code !== 0) {
      throw new Error(
        plainText(result.stderr).slice(0, 1000) || `Rex exited with status ${result.code}.`
      );
    }
  }

  async function forkSession(target: string, ctx: ExtensionContext) {
    const signal = sessionAbort.signal;
    try {
      if (target && target !== "split" && target !== "tab") {
        throw new Error("Usage: /rex-fork [split | tab]");
      }
      const session = process.env.REX_SESSION;
      const block = process.env.REX_BLOCK;
      if (!session || !block || process.env.TMUX || process.env.STY) {
        throw new Error("Run /rex-fork directly inside a Rex terminal.");
      }
      if (!ctx.hasUI || ctx.mode !== "tui") {
        throw new Error("/rex-fork requires an interactive Pi session.");
      }
      if (!ctx.isIdle()) throw new Error("Wait for Pi to finish before forking.");
      const placement = (target ||
        (await ctx.ui.select("Fork Pi session", ["split", "tab"], { signal }))) as
        | Placement
        | undefined;
      signal.throwIfAborted();
      if (!placement) return;
      if (!ctx.isIdle()) throw new Error("Wait for Pi to finish before forking.");
      const source = ctx.sessionManager.getSessionFile();
      const leaf = ctx.sessionManager.getLeafId();
      if (
        !source ||
        !leaf ||
        !ctx.sessionManager
          .getBranch()
          .some(
            (entry) =>
              entry.type === "message" &&
              (entry.message.role === "user" || entry.message.role === "assistant")
          )
      ) {
        throw new Error("Send a message in a saved Pi session before forking.");
      }
      // The live leaf can differ from the last entry on disk after /tree navigation.
      // Branch a detached manager so the original Pi session stays unchanged.
      const directory = ctx.sessionManager.getSessionDir();
      const fork = SessionManager.open(source, directory).createBranchedSession(leaf);
      if (!fork) throw new Error("Could not save the forked Pi session.");
      const command = ["run", "-s", session, "--cwd", ctx.cwd, "--keep-open", "--json"];
      if (placement === "split") command.push("-b", block, "--split=right");
      command.push("--", "pi", "--session", fork, "--session-dir", directory);
      try {
        await runRex(command, ctx);
      } catch (error) {
        throw new Error(
          `Fork saved at ${fork}, but Rex could not confirm opening it. Check Rex before retrying. ${error instanceof Error ? error.message : String(error)}`
        );
      }
      ctx.ui.notify(
        `Opened a fork in a new Rex ${placement === "split" ? "split pane" : "tab"}.`,
        "info"
      );
    } catch (error) {
      if (!signal.aborted && ctx.hasUI)
        ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
    }
  }

  // Rex key bindings can send these keys rather than typing a command over the editor's draft.
  pi.registerShortcut("ctrl+alt+f", {
    description: "Fork Pi into a Rex split",
    handler: (ctx) => forkSession("split", ctx),
  });
  pi.registerShortcut("ctrl+alt+t", {
    description: "Fork Pi into a Rex tab",
    handler: (ctx) => forkSession("tab", ctx),
  });

  pi.registerCommand("rex-fork", {
    description: "Fork this conversation into a Rex split or tab",
    getArgumentCompletions: (prefix) => {
      const items = ["split", "tab"]
        .filter((value) => value.startsWith(prefix))
        .map((value) => ({ value, label: value }));
      return items.length ? items : null;
    },
    handler: (args, ctx) => forkSession(args.trim(), ctx),
  });
}

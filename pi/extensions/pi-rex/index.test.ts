import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import {
  SessionManager,
  type ExtensionAPI,
  type ExtensionCommandContext,
  type ExtensionContext,
  type ExtensionEvent,
} from "@earendil-works/pi-coding-agent";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import rexForkExtension from "./index.js";

type Handler = (event: never, ctx: ExtensionContext) => unknown;

function setup(
  exec: ExtensionAPI["exec"] = async () => ({ stdout: "", stderr: "", code: 0, killed: false })
) {
  const handlers = new Map<string, Handler>();
  const shortcuts = new Map<string, Parameters<ExtensionAPI["registerShortcut"]>[1]>();
  const commands = new Map<string, Parameters<ExtensionAPI["registerCommand"]>[1]>();
  const notifications: string[] = [];
  const sessionManager: ExtensionContext["sessionManager"] = SessionManager.inMemory("/project");
  // SAFETY: Unused UI methods deliberately fail if accessed.
  const ui = {
    notify: (message: string) => {
      notifications.push(message);
    },
    select: async (_title: string, _options: string[]): Promise<string | undefined> => undefined,
  } as ExtensionContext["ui"];
  // SAFETY: This fixture supplies the context properties used by the registered handlers.
  const ctx = {
    cwd: "/project",
    mode: "tui",
    hasUI: true,
    isIdle: () => false,
    sessionManager,
    ui,
  } as ExtensionCommandContext;
  const api: Partial<ExtensionAPI> = {
    on(name, handler) {
      // SAFETY: Tests only dispatch the named event's fixture to its registered handler.
      handlers.set(name, handler as Handler);
      return () => {
        handlers.delete(name);
      };
    },
    registerCommand: (name, definition) => {
      commands.set(name, definition);
    },
    registerShortcut: (key, definition) => {
      shortcuts.set(key, definition);
    },
    exec,
  };
  // SAFETY: The fixture implements registration and exec; no other API is used.
  rexForkExtension(api as ExtensionAPI);
  return {
    ctx,
    handlers,
    commands,
    notifications,
    emit: (name: string, event: Partial<ExtensionEvent> = {}) => {
      // SAFETY: Each test pairs a registered event name with its event-specific fixture fields.
      return handlers.get(name)?.(event as never, ctx);
    },
    command: (args: string) => {
      const command = commands.get("rex-fork");
      if (!command) throw new Error("Missing command: rex-fork");
      return command.handler(args, ctx);
    },
    shortcut: (key: string) => {
      const shortcut = shortcuts.get(key);
      if (!shortcut) throw new Error(`Missing shortcut: ${key}`);
      return shortcut.handler(ctx);
    },
  };
}

const originalEnv = { ...process.env };
let output: string[];
let restoreWrite: () => void;

beforeEach(() => {
  process.env.REX_SESSION = "session:agent";
  process.env.REX_BLOCK = "block:agent";
  delete process.env.TMUX;
  delete process.env.STY;
  output = [];
  const write = spyOn(process.stdout, "write").mockImplementation((chunk) => {
    output.push(String(chunk));
    return true;
  });
  restoreWrite = () => write.mockRestore();
});

afterEach(() => {
  restoreWrite();
  for (const key of ["REX_SESSION", "REX_BLOCK", "TMUX", "STY"]) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

test("only forks: no prompt text, no status reports, no Rex calls during a run", async () => {
  let attempts = 0;
  const app = setup(async () => {
    attempts++;
    return { stdout: "", stderr: "", code: 0, killed: false };
  });
  expect([...app.commands.keys()]).toEqual(["rex-fork"]);
  expect([...app.handlers.keys()].sort()).toEqual(["session_shutdown", "session_start"]);
  await app.emit("session_start");
  expect(await app.emit("before_agent_start", { systemPrompt: "Base" })).toBeUndefined();
  await app.emit("agent_start");
  await app.emit("agent_settled");
  await app.emit("session_shutdown", { reason: "quit" });
  expect(output).toEqual([]);
  expect(attempts).toBe(0);
});

test.each([
  ["picker", "split"],
  ["command", "tab"],
  ["ctrl+alt+f", "split"],
  ["ctrl+alt+t", "tab"],
])(
  "%s forks the selected branch into a Rex %s without changing the source",
  async (trigger, placement) => {
    const directory = await mkdtemp(join(tmpdir(), "pi-rex-fork-"));
    const source = join(directory, "source.jsonl");
    const timestamp = "2026-10-17T12:00:00.000Z";
    const original =
      [
        { type: "session", version: 3, id: "original", timestamp, cwd: "/project with spaces" },
        {
          type: "message",
          id: "root",
          parentId: null,
          timestamp,
          message: { role: "user", content: "Common history", timestamp: 1 },
        },
        {
          type: "message",
          id: "chosen",
          parentId: "root",
          timestamp,
          message: { role: "user", content: "Selected branch", timestamp: 2 },
        },
        {
          type: "message",
          id: "other",
          parentId: "root",
          timestamp,
          message: { role: "user", content: "Wrong branch", timestamp: 3 },
        },
      ]
        .map((entry) => JSON.stringify(entry))
        .join("\n") + "\n";
    try {
      await writeFile(source, original);
      const manager = SessionManager.open(source, directory);
      manager.branch("chosen");
      let launched: string[] = [];
      const app = setup(async (command, args) => {
        expect(command).toBe("rex");
        launched = args;
        return { stdout: "{}", stderr: "", code: 0, killed: false };
      });
      app.ctx.sessionManager = manager;
      app.ctx.cwd = "/project with spaces";
      app.ctx.isIdle = () => true;
      app.ctx.ui.select = async (_title, options) => {
        expect(options).toEqual(["split", "tab"]);
        return "split";
      };
      if (trigger === "picker") await app.command("");
      else if (trigger === "command") await app.command("tab");
      else await app.shortcut(trigger);
      expect(app.notifications.at(-1)).toContain(
        `new Rex ${placement === "split" ? "split pane" : "tab"}`
      );
      const separator = launched.indexOf("--");
      expect(launched.slice(0, separator)).toEqual([
        "run",
        "-s",
        "session:agent",
        "--cwd",
        "/project with spaces",
        "--keep-open",
        "--json",
        ...(placement === "split" ? ["-b", "block:agent", "--split=right"] : []),
      ]);
      const forkFile = launched[separator + 3];
      expect(launched.slice(separator + 1)).toEqual([
        "pi",
        "--session",
        forkFile,
        "--session-dir",
        directory,
      ]);
      expect(forkFile).not.toBe(source);
      const fork = SessionManager.open(forkFile, directory);
      expect(fork.getSessionId()).not.toBe("original");
      expect(fork.getHeader()?.parentSession).toBe(source);
      expect(
        fork
          .buildSessionContext()
          .messages.map((message) => (message.role === "user" ? message.content : message.role))
      ).toEqual(["Common history", "Selected branch"]);
      expect(manager.getLeafId()).toBe("chosen");
      expect(manager.getSessionFile()).toBe(source);
      expect(await readFile(source, "utf8")).toBe(original);
      expect(await readdir(directory)).toHaveLength(2);
    } finally {
      await rm(directory, { recursive: true });
    }
  }
);

test("fork refuses unsafe contexts and cancelling the picker launches nothing", async () => {
  let launches = 0;
  const app = setup(async () => {
    launches++;
    return { stdout: "", stderr: "", code: 0, killed: false };
  });
  await app.command("split");
  expect(app.notifications.at(-1)).toContain("Wait for Pi");
  app.ctx.isIdle = () => true;
  await app.command("sideways");
  expect(app.notifications.at(-1)).toContain("Usage: /rex-fork");
  await app.command("split");
  expect(app.notifications.at(-1)).toContain("saved Pi session");
  app.notifications.length = 0;
  await app.command("");
  expect(app.notifications).toEqual([]);
  process.env.TMUX = "nested";
  await app.command("tab");
  expect(app.notifications.at(-1)).toContain("directly inside a Rex terminal");
  delete process.env.TMUX;
  delete process.env.REX_SESSION;
  await app.command("tab");
  expect(app.notifications.at(-1)).toContain("directly inside a Rex terminal");
  expect(launches).toBe(0);
});

test("reports a saved fork path when Rex cannot confirm the launch", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pi-rex-fork-"));
  const source = join(directory, "source.jsonl");
  const timestamp = "2026-10-17T12:00:00.000Z";
  await writeFile(
    source,
    [
      { type: "session", version: 3, id: "original", timestamp, cwd: "/project" },
      {
        type: "message",
        id: "root",
        parentId: null,
        timestamp,
        message: { role: "user", content: "Hello", timestamp: 1 },
      },
    ]
      .map((entry) => JSON.stringify(entry))
      .join("\n") + "\n"
  );
  try {
    const app = setup(async () => ({
      stdout: "",
      stderr: "\x1b[31mserver unreachable\x1b[0m",
      code: 1,
      killed: false,
    }));
    app.ctx.sessionManager = SessionManager.open(source, directory);
    app.ctx.isIdle = () => true;
    await app.command("tab");
    expect(app.notifications.at(-1)).toContain("Fork saved at");
    expect(app.notifications.at(-1)).toContain("server unreachable");
    expect(app.notifications.at(-1)).not.toContain("\x1b");
  } finally {
    await rm(directory, { recursive: true });
  }
});

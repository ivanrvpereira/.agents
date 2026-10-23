import { SessionManager, type ExtensionAPI, type ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import * as path from "node:path";

/**
 * /split — copy the current conversation into a new Rex pane.
 *
 * Usage:
 *   /split              vertical split (pane below)
 *   /split h            horizontal split (pane to the right)
 *   /split [h] prompt   optionally send a prompt to the forked session
 *
 * Requires Rex with rex on PATH and REX_SESSION / REX_BLOCK set.
 * The legacy filename is retained so existing extension symlinks stay valid.
 */

function getPiInvocationParts(): string[] {
	const currentScript = process.argv[1];
	if (currentScript && existsSync(currentScript)) {
		return [process.execPath, currentScript];
	}

	const execName = path.basename(process.execPath).toLowerCase();
	if (!/^(node|bun)(\.exe)?$/.test(execName)) {
		return [process.execPath];
	}

	return ["pi"];
}

export default function (pi: ExtensionAPI): void {
	async function forkToRexPane(ctx: ExtensionCommandContext, direction: "h" | "v", prompt: string): Promise<void> {
		const session = process.env.REX_SESSION;
		const block = process.env.REX_BLOCK;
		if (!session || !block) {
			ctx.ui.notify("Run /split inside a Rex terminal pane", "error");
			return;
		}

		let forkFile: string | undefined;
		try {
			await ctx.waitForIdle();
			const sessionFile = ctx.sessionManager.getSessionFile();
			const leafId = ctx.sessionManager.getLeafId();
			if (!sessionFile || !leafId || !existsSync(sessionFile)) {
				throw new Error("No saved conversation to split yet");
			}

			// Clone through the selected leaf, not the last entry saved on another branch.
			// A separate manager leaves the original session and its runtime untouched.
			const fork = SessionManager.open(sessionFile, ctx.sessionManager.getSessionDir());
			forkFile = fork.createBranchedSession(leafId);
			if (!forkFile) throw new Error("Could not create a session copy");

			const command = [...getPiInvocationParts(), "--session", forkFile];
			if (prompt) {
				// Even after --, Pi treats a leading @ as an attachment.
				command.push("--", prompt.startsWith("@") ? ` ${prompt}` : prompt);
			}

			const { code, stderr, stdout } = await pi.exec("rex", [
				"split", "-s", session, "-b", block,
				`--split=${direction === "h" ? "right" : "below"}`,
				"-c", ctx.cwd, "--focus=false", "--shell=none", "--", ...command,
			]);
			if (code !== 0) throw new Error(stderr.trim() || stdout.trim() || "Rex split failed");

			ctx.ui.notify(`Opened a session copy in a new Rex pane${prompt ? " with a starting prompt" : ""}.`, "info");
		} catch (error) {
			const detail = error instanceof Error ? error.message : String(error);
			// Keep the copy: a failed or timed-out request can still have opened a pane.
			const saved = forkFile ? `\nSession copy: ${forkFile}` : "";
			ctx.ui.notify(`Could not split session: ${detail}${saved}`, "error");
		}
	}

	pi.registerCommand("split", {
		description: "Copy the current conversation into a Rex pane (below; 'h' for right, optional prompt)",
		handler: async (args, ctx) => {
			const trimmed = (args ?? "").trim();
			const match = /^([hv])(?:\s+|$)/.exec(trimmed);
			const direction = match?.[1] === "h" ? "h" : "v";
			const prompt = match ? trimmed.slice(match[0].length) : trimmed;
			await forkToRexPane(ctx, direction, prompt);
		},
	});
}

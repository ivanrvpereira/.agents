import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import * as path from "node:path";

/**
 * /split — fork the current session into a new tmux pane.
 *
 * Usage:
 *   /split              vertical split (pane below)
 *   /split h            horizontal split (pane to the right)
 *   /split [h] prompt   optionally send a prompt to the forked session
 *
 * Requires tmux >= 3.0: the command is passed as multiple arguments to
 * split-window, which exec's it directly (no shell interpretation).
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
	async function forkToTmuxPane(ctx: ExtensionCommandContext, direction: "h" | "v", prompt: string): Promise<void> {
		const sessionFile = ctx.sessionManager.getSessionFile();
		if (!sessionFile) {
			ctx.ui.notify("No active session to fork", "error");
			return;
		}

		const inTmux = await pi.exec("tmux", ["display-message", "-p", "#{session_name}"]);
		if (inTmux.code !== 0) {
			ctx.ui.notify("Not inside a tmux session", "error");
			return;
		}

		// tmux: -h places the new pane to the right, -v below
		const flag = direction === "h" ? "-h" : "-v";
		const command = [...getPiInvocationParts(), "--fork", sessionFile];
		if (prompt.length > 0) {
			// pi parses args starting with "-" as options and "@" as file
			// attachments, with no "--" separator. A leading space makes the
			// arg parse as a plain message while leaving the prompt intact.
			command.push(/^[-@]/.test(prompt) ? ` ${prompt}` : prompt);
		}

		const { code, stderr } = await pi.exec("tmux", ["split-window", flag, "-c", ctx.cwd, ...command]);
		if (code !== 0) {
			ctx.ui.notify(`tmux split failed: ${stderr?.trim() || "unknown error"}`, "error");
			return;
		}

		const suffix = prompt ? " and sent prompt" : "";
		ctx.ui.notify(`Forked session into new tmux pane${suffix}.`, "info");
	}

	pi.registerCommand("split", {
		description: "Fork session into a new tmux pane (vertical split; 'h' for horizontal, optional prompt)",
		handler: async (args, ctx) => {
			const trimmed = (args ?? "").trim();
			const [first, ...rest] = trimmed.split(/\s+/);
			let direction: "h" | "v" = "v";
			let prompt = trimmed;

			if (first === "h" || first === "v") {
				direction = first;
				prompt = rest.join(" ");
			}

			await forkToTmuxPane(ctx, direction, prompt);
		},
	});
}

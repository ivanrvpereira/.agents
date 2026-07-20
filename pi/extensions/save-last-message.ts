import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";

type BranchEntry = {
	type: string;
	message?: {
		role?: string;
		content?: unknown;
	};
};

export function lastAssistantText(entries: BranchEntry[]): string | undefined {
	for (let index = entries.length - 1; index >= 0; index--) {
		const entry = entries[index];
		if (entry?.type !== "message" || entry.message?.role !== "assistant") continue;
		// Skip assistant entries without text (e.g. tool-call-only turns) and
		// keep scanning back for the latest response that actually has text.
		if (!Array.isArray(entry.message.content)) continue;

		const text = entry.message.content
			.filter((block): block is { type: "text"; text: string } => {
				if (!block || typeof block !== "object") return false;
				const candidate = block as { type?: unknown; text?: unknown };
				return candidate.type === "text" && typeof candidate.text === "string";
			})
			.map((block) => block.text)
			.join("\n")
			.trimEnd();

		if (text) return text;
	}
}

function defaultFilename(): string {
	const now = new Date();
	const pad = (value: number) => String(value).padStart(2, "0");
	const stamp =
		`${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
		`-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
	return `agent-message-${stamp}.md`;
}

export function outputPath(argument: string, cwd: string): string {
	let requested = argument.trim();
	if (
		requested.length >= 2 &&
		((requested.startsWith('"') && requested.endsWith('"')) || (requested.startsWith("'") && requested.endsWith("'")))
	) {
		requested = requested.slice(1, -1).trim();
	}
	// Expand ~ before appending .md, otherwise "~" becomes a literal "~.md" file.
	if (requested === "~") return join(homedir(), defaultFilename());
	if (requested.startsWith("~/")) requested = join(homedir(), requested.slice(2));
	if (!requested) requested = defaultFilename();
	if (!extname(requested)) requested += ".md";
	return resolve(cwd, requested);
}

export default function saveLastMessage(pi: ExtensionAPI): void {
	pi.registerCommand("save-last", {
		description: "Save the last assistant message as Markdown (/save-last [path])",
		handler: async (args, ctx) => {
			const text = lastAssistantText(ctx.sessionManager.getBranch());
			if (!text) {
				ctx.ui.notify("The last assistant message has no text to save", "warning");
				return;
			}

			const path = outputPath(args, ctx.cwd);
			try {
				await mkdir(dirname(path), { recursive: true });
				await writeFile(path, `${text}\n`, { encoding: "utf8", flag: "wx" });
				ctx.ui.notify(`Saved last assistant message to ${path}`, "info");
			} catch (error) {
				const detail = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Could not save message: ${detail}`, "error");
			}
		},
	});
}

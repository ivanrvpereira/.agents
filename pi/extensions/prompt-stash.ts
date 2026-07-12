import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

interface StashEntry {
	text: string;
	ts: number;
}

// Stashes are keyed by project cwd in one global file: survives restarts,
// shared across sessions in the same project, nothing written into the repo.
type StashFile = Record<string, StashEntry[]>;

const STASH_PATH = join(homedir(), ".pi", "agent", "prompt-stash.json");

function load(): StashFile {
	try {
		return JSON.parse(readFileSync(STASH_PATH, "utf8"));
	} catch {
		return {};
	}
}

function save(data: StashFile): void {
	mkdirSync(dirname(STASH_PATH), { recursive: true });
	writeFileSync(STASH_PATH, JSON.stringify(data, null, 2));
}

function timeAgo(ts: number): string {
	const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
	if (s < 60) return `${s}s`;
	if (s < 3600) return `${Math.round(s / 60)}m`;
	if (s < 86400) return `${Math.round(s / 3600)}h`;
	return `${Math.round(s / 86400)}d`;
}

function preview(text: string): string {
	const firstLine = text.trim().split("\n")[0] ?? "";
	return firstLine.length > 60 ? `${firstLine.slice(0, 60)}…` : firstLine;
}

export default function promptStash(pi: ExtensionAPI) {
	const stashCurrent = (ctx: ExtensionContext): void => {
		const text = ctx.ui.getEditorText().trim();
		if (!text) return;
		const data = load();
		(data[ctx.cwd] ??= []).unshift({ text, ts: Date.now() });
		save(data);
		ctx.ui.setEditorText("");
		ctx.ui.notify(`Stashed prompt (${data[ctx.cwd]?.length} in stash)`, "info");
	};

	const openNavigator = async (ctx: ExtensionContext): Promise<void> => {
		const data = load();
		const entries = data[ctx.cwd] ?? [];
		if (entries.length === 0) {
			ctx.ui.notify("No stashed prompts for this project", "info");
			return;
		}
		const labels = entries.map((e, i) => `#${i + 1} · ${timeAgo(e.ts)} ago · ${preview(e.text)}`);
		const choice = await ctx.ui.select("Pop stashed prompt:", labels);
		if (choice === undefined) return;
		const entry = entries.splice(labels.indexOf(choice), 1)[0];
		if (entries.length > 0) data[ctx.cwd] = entries;
		else delete data[ctx.cwd];
		save(data);
		if (!entry) return;
		const current = ctx.ui.getEditorText();
		ctx.ui.setEditorText(current.trim() ? `${current}\n${entry.text}` : entry.text);
	};

	pi.registerShortcut("ctrl+x", {
		description: "Stash current prompt (editor empty: open stash navigator)",
		handler: async (ctx) => {
			if (!ctx.hasUI) return;
			if (ctx.ui.getEditorText().trim()) stashCurrent(ctx);
			else await openNavigator(ctx);
		},
	});

	pi.registerCommand("stash", {
		description: "Pick a stashed prompt to restore into the editor",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) return;
			await openNavigator(ctx);
		},
	});
}

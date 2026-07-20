/**
 * Custom footer: same as built-in, but adds context token count,
 * colors context usage (green <80k, yellow >80k, red >120k),
 * and shows git stats (modified, new, deleted, ahead/behind, stash).
 */
import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function formatTokens(count: number): string {
	if (count < 1000) return count.toString();
	if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
	if (count < 1_000_000) return `${Math.round(count / 1000)}k`;
	if (count < 10_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
	return `${Math.round(count / 1_000_000)}M`;
}

function sanitize(text: string): string {
	return text.replace(/[\r\n\t]/g, " ").replace(/ +/g, " ").trim();
}

function numeric(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function usageCacheWrite(usage: any): number {
	// cacheWrite1h is a subset of cacheWrite in recent pi versions.
	return numeric(usage?.cacheWrite);
}

function cacheHitRatio(usage: any): number | null {
	const input = numeric(usage?.input);
	const cacheRead = numeric(usage?.cacheRead);
	const cacheWrite = usageCacheWrite(usage);
	const total = input + cacheRead + cacheWrite;
	return total > 0 ? cacheRead / total : null;
}

function formatPercent(value: number): string {
	return `${Math.round(value * 100)}%`;
}

function formatMultiplier(value: number): string {
	if (!Number.isFinite(value)) return "?";
	return value < 10 ? value.toFixed(1) : Math.round(value).toString();
}

function formatRate(value: number): string {
	if (value <= 0) return "$0/m";
	if (value < 0.001) return "<$0.001/m";
	return `$${value < 0.1 ? value.toFixed(3) : value.toFixed(2)}/m`;
}

// High-contrast 256-color codes per thinking level (bold for extra pop).
const THINKING_ANSI: Record<string, string> = {
	off: "38;5;244", // gray
	minimal: "38;5;51", // cyan
	low: "38;5;39", // blue
	medium: "38;5;46", // green (normal)
	high: "38;5;208", // orange
	xhigh: "38;5;196", // red
};

function colorThinking(level: string, text: string): string {
	const code = THINKING_ANSI[level] ?? "38;5;250";
	return `\x1b[1;${code}m${text}\x1b[0m`;
}

function colorModel(modelId: string, fallback: string): string {
	const id = modelId.toLowerCase();
	if (id.includes("fable")) return `\x1b[1;97;41m${modelId}\x1b[0m`;
	if (id.includes("gpt-5.6-sol")) return `\x1b[1;97;44m${modelId}\x1b[0m`;
	return fallback;
}

// 256-color ANSI wrapper for high-contrast, theme-independent accents (bold by default).
function ansi256(code: number, text: string, bold = true): string {
	return `\x1b[${bold ? "1;" : ""}38;5;${code}m${text}\x1b[0m`;
}

const CACHE_VOLUME = 15; // white — R/W cache volume
const GOOD = 46; // green — healthy cache efficiency
const BAD = 208; // orange — poor cache efficiency
const CONTEXT_COLOR = 220; // gold — context usage

function hashText(text: string): string {
	return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function selectedToolNames(selectedTools: unknown): string[] {
	if (!selectedTools) return [];
	if (Array.isArray(selectedTools)) {
		return selectedTools.map((tool: any) => {
			if (typeof tool === "string") return tool;
			return tool?.name ?? tool?.tool?.name ?? JSON.stringify(tool);
		}).filter(Boolean).sort();
	}
	if (typeof selectedTools === "object") return Object.keys(selectedTools as Record<string, unknown>).sort();
	return [String(selectedTools)];
}

function isCompactionEnabled(): boolean {
	for (const path of [
		join(process.cwd(), ".pi", "settings.json"),
		join(process.env.HOME || "", ".pi", "agent", "settings.json"),
	]) {
		try {
			if (existsSync(path)) {
				const s = JSON.parse(readFileSync(path, "utf-8"));
				if (s?.compaction?.enabled !== undefined) return s.compaction.enabled;
			}
		} catch {}
	}
	return true;
}

interface GitStats {
	modified: number;
	added: number;
	deleted: number;
	untracked: number;
	ahead: number;
	behind: number;
	stash: number;
}

function getGitStats(): GitStats | null {
	try {
		const out = execSync("git status --porcelain -b", { encoding: "utf-8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"] });
		const lines = out.split("\n").filter(Boolean);
		const stats: GitStats = { modified: 0, added: 0, deleted: 0, untracked: 0, ahead: 0, behind: 0, stash: 0 };

		for (const line of lines) {
			if (line.startsWith("##")) {
				const m = line.match(/\[ahead (\d+)(?:, behind (\d+))?\]|\[behind (\d+)\]/);
				if (m) {
					stats.ahead = parseInt(m[1] || "0", 10);
					stats.behind = parseInt(m[2] || m[3] || "0", 10);
				}
				continue;
			}
			const x = line[0], y = line[1];
			if (x === "?" && y === "?") { stats.untracked++; continue; }
			if (x === "A" || y === "A") { stats.added++; continue; }
			if (x === "D" || y === "D") { stats.deleted++; continue; }
			if (x === "M" || y === "M" || x === "R" || y === "R") { stats.modified++; continue; }
		}

		try {
			const stashOut = execSync("git stash list", { encoding: "utf-8", timeout: 2000, stdio: ["pipe", "pipe", "pipe"] });
			stats.stash = stashOut.split("\n").filter(Boolean).length;
		} catch {}

		return stats;
	} catch {
		return null;
	}
}

function formatGitStats(stats: GitStats, theme: any): string {
	const parts: string[] = [];
	if (stats.modified) parts.push(theme.fg("warning", `~${stats.modified}`));
	if (stats.added) parts.push(theme.fg("success", `+${stats.added}`));
	if (stats.deleted) parts.push(theme.fg("error", `-${stats.deleted}`));
	if (stats.untracked) parts.push(theme.fg("dim", `?${stats.untracked}`));
	if (stats.ahead) parts.push(theme.fg("accent", `↑${stats.ahead}`));
	if (stats.behind) parts.push(theme.fg("accent", `↓${stats.behind}`));
	if (stats.stash) parts.push(theme.fg("dim", `stash:${stats.stash}`));
	return parts.join(" ");
}

export default function (pi: ExtensionAPI) {
	let cachedGitStats: GitStats | null = null;
	let isGitRepo: boolean | null = null;
	let lastCwd: string | null = null;
	let lastSystemPromptHash: string | null = null;
	let lastToolSetHash: string | null = null;
	let promptChangedAt = 0;
	let toolsChangedAt = 0;

	function detectGitRepo(): boolean {
		try {
			const out = execSync("git rev-parse --is-inside-work-tree", {
				encoding: "utf-8",
				timeout: 2000,
				stdio: ["pipe", "pipe", "pipe"],
			}).trim();
			return out === "true";
		} catch {
			return false;
		}
	}

	function refreshGitStats() {
		const cwd = process.cwd();
		if (cwd !== lastCwd) {
			lastCwd = cwd;
			isGitRepo = detectGitRepo();
		}
		cachedGitStats = isGitRepo ? getGitStats() : null;
	}

	pi.on("before_agent_start", async (event) => {
		const systemHash = hashText(event.systemPrompt ?? "");
		const toolHash = hashText(selectedToolNames((event.systemPromptOptions as any)?.selectedTools).join("\n"));

		if (lastSystemPromptHash && lastSystemPromptHash !== systemHash) promptChangedAt = Date.now();
		if (lastToolSetHash && lastToolSetHash !== toolHash) toolsChangedAt = Date.now();

		lastSystemPromptHash = systemHash;
		lastToolSetHash = toolHash;
	});

	pi.on("session_start", async (_event, ctx) => {
		refreshGitStats();

		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsub = footerData.onBranchChange(() => {
				refreshGitStats();
				tui.requestRender();
			});
			const refreshTimer = setInterval(() => tui.requestRender(), 30_000);
			refreshTimer.unref?.();

			return {
				dispose: () => {
					unsub();
					clearInterval(refreshTimer);
				},
				invalidate() {},
				render(width: number): string[] {
					// Token totals
					let totalInput = 0, totalOutput = 0, totalCacheRead = 0, totalCacheWrite = 0, totalCost = 0;
					const assistantMessages: AssistantMessage[] = [];
					for (const e of ctx.sessionManager.getEntries()) {
						if (e.type === "message" && e.message.role === "assistant") {
							const m = e.message as AssistantMessage;
							assistantMessages.push(m);
							totalInput += numeric(m.usage.input);
							totalOutput += numeric(m.usage.output);
							totalCacheRead += numeric(m.usage.cacheRead);
							totalCacheWrite += usageCacheWrite(m.usage);
							totalCost += numeric(m.usage.cost?.total);
						}
					}

					// Context usage
					const usage = ctx.getContextUsage();
					const contextWindow = usage?.contextWindow ?? ctx.model?.contextWindow ?? 0;
					const contextTokens = usage?.tokens ?? 0;
					const contextPercent = usage?.percent !== null && usage?.percent !== undefined
						? usage.percent.toFixed(1) : "?";

					// PWD + git branch + session name
					let pwd = process.cwd();
					const home = process.env.HOME || process.env.USERPROFILE;
					if (home && pwd.startsWith(home)) pwd = `~${pwd.slice(home.length)}`;
					const branch = isGitRepo ? footerData.getGitBranch() : null;
					if (branch) pwd = `${pwd} (${branch})`;
					const sessionName = ctx.sessionManager.getSessionName();
					if (sessionName) pwd = `${pwd} • ${sessionName}`;

					// Git stats on pwd line
					if (cachedGitStats) {
						const gitStr = formatGitStats(cachedGitStats, theme);
						if (gitStr) pwd = `${pwd} ${gitStr}`;
					}

					const latestAssistant = assistantMessages.at(-1);
					const previousAssistant = assistantMessages.at(-2);
					const latestHitRatio = latestAssistant ? cacheHitRatio(latestAssistant.usage) : null;
					const latestInput = latestAssistant ? numeric(latestAssistant.usage.input) : 0;
					const latestCacheRead = latestAssistant ? numeric(latestAssistant.usage.cacheRead) : 0;
					const latestCacheWrite = latestAssistant ? usageCacheWrite(latestAssistant.usage) : 0;
					const previousCacheRead = previousAssistant ? numeric(previousAssistant.usage.cacheRead) : 0;
					const previousCacheContext = previousAssistant
						? numeric(previousAssistant.usage.input) + previousCacheRead + usageCacheWrite(previousAssistant.usage)
						: 0;
					const cacheBust = previousCacheRead > 20_000
						&& previousCacheContext > 0
						&& latestCacheRead < 0.6 * previousCacheContext
						&& latestCacheWrite > 15_000;
					const cacheMiss = !cacheBust
						&& previousCacheRead > 20_000
						&& previousCacheContext > 0
						&& latestCacheRead < 0.6 * previousCacheContext
						&& latestCacheWrite === 0
						&& latestInput > 10_000;

					const now = Date.now();
					const recentMessages = assistantMessages.filter(m => numeric(m.timestamp) >= now - 5 * 60_000);
					const recentCost = recentMessages.reduce((sum, m) => sum + numeric(m.usage.cost?.total), 0);
					const firstRecentAt = recentMessages.length ? Math.min(...recentMessages.map(m => numeric(m.timestamp))) : now;
					const rateWindowMs = Math.min(5 * 60_000, Math.max(60_000, now - firstRecentAt));
					const costPerMinute = recentCost / (rateWindowMs / 60_000);

					const rewriteMultiplier = contextTokens > 0 ? totalCacheWrite / contextTokens : 0;
					const recentlyChanged = now - Math.max(promptChangedAt, toolsChangedAt) < 2 * 60_000;

					// Stats parts
					const parts: string[] = [];
					if (totalInput) parts.push(theme.fg("accent", theme.bold(`↑${formatTokens(totalInput)}`)));
					if (totalOutput) parts.push(theme.fg("accent", theme.bold(`↓${formatTokens(totalOutput)}`)));
					// Cache volume (white); efficiency metrics green when good, orange when bad
					if (totalCacheRead) parts.push(ansi256(CACHE_VOLUME, `R${formatTokens(totalCacheRead)}`, false));
					parts.push(ansi256(CACHE_VOLUME, `W${formatTokens(totalCacheWrite)}`, false));
					if (latestHitRatio !== null) parts.push(ansi256(latestHitRatio >= 0.85 ? GOOD : BAD, `⚡${formatPercent(latestHitRatio)}`));
					const sessionCacheTotal = totalInput + totalCacheRead + totalCacheWrite;
					if (sessionCacheTotal > 0) {
						const sessionHitRatio = totalCacheRead / sessionCacheTotal;
						parts.push(ansi256(sessionHitRatio >= 0.85 ? GOOD : BAD, `Σ⚡${formatPercent(sessionHitRatio)}`));
					}
					if (contextTokens > 0) parts.push(ansi256(rewriteMultiplier < 2 ? GOOD : BAD, `↻${formatMultiplier(rewriteMultiplier)}×`));

					// Alerts
					if (cacheBust) parts.push(theme.fg("error", `⚠BURST+${formatTokens(latestCacheWrite)}`));
					if (cacheMiss) parts.push(theme.fg("error", `⚠MISS+${formatTokens(latestInput)}`));
					if (recentlyChanged) {
						if (now - promptChangedAt < 2 * 60_000) parts.push(theme.fg("warning", "promptΔ"));
						if (now - toolsChangedAt < 2 * 60_000) parts.push(theme.fg("warning", "toolsΔ"));
					}

					// Context (gold) — its own high-contrast color
					const autoIndicator = isCompactionEnabled() ? " (auto)" : "";
					const contextDisplay = contextPercent === "?"
						? `?/${formatTokens(contextWindow)}${autoIndicator}`
						: `${formatTokens(contextTokens)}/${formatTokens(contextWindow)} ${contextPercent}%${autoIndicator}`;
					parts.push(ansi256(CONTEXT_COLOR, contextDisplay));

					// Cost (last) — lit up a bit above dim, rounded to whole dollars
					if (totalCost) {
						parts.push(theme.fg("text", `$${Math.round(totalCost)}`));
						if (costPerMinute > 0) parts.push(theme.fg("text", formatRate(costPerMinute)));
					}

					// Extension statuses (keepalive etc.) go before the model name.
					const statuses = footerData.getExtensionStatuses();
					const statusStr = statuses.size > 0
						? Array.from(statuses.entries())
							.sort(([a], [b]) => a.localeCompare(b))
							.map(([, t]) => sanitize(t))
							.join(" ")
						: "";

					// Right side: statuses + model (highlighted) + thinking level (own color)
					const modelId = ctx.model?.id || "no-model";
					const level = ctx.model?.reasoning ? pi.getThinkingLevel() : null;
					const levelLabel = level === null ? "" : level === "off" ? "thinking off" : level;
					const levelSuffix = levelLabel ? ` • ${levelLabel}` : "";

					let statsLeft = parts.join(" ");
					const statsLeftWidth = visibleWidth(statsLeft);

					const rightPlain = `${statusStr ? `${statusStr} ` : ""}${modelId}${levelSuffix}`;
					const rightColored =
						(statusStr ? theme.fg("text", `${statusStr} `) : "") +
						colorModel(modelId, theme.bold(theme.fg("accent", modelId))) +
						(levelLabel ? theme.fg("dim", " • ") + colorThinking(level!, levelLabel) : "");
					const rightWidth = visibleWidth(rightPlain);

					const pwdLine = truncateToWidth(theme.fg("dim", pwd), width, theme.fg("dim", "..."));
					const lines = [pwdLine];

					if (statsLeftWidth + 2 + rightWidth <= width) {
						// Wide: single line, right side right-aligned.
						lines.push(statsLeft + " ".repeat(width - statsLeftWidth - rightWidth) + rightColored);
					} else {
						// Narrow: split the status line — stats on one line, status+model on the next.
						if (statsLeftWidth > width) statsLeft = truncateToWidth(statsLeft, width, "...");
						lines.push(statsLeft);
						if (rightWidth <= width) {
							lines.push(" ".repeat(width - rightWidth) + rightColored);
						} else {
							lines.push(truncateToWidth(rightPlain, width, "..."));
						}
					}
					return lines;
				},
			};
		});
	});

	// Refresh git stats on events that likely change files
	pi.on("turn_end", async () => refreshGitStats());
	pi.on("session_compact", async () => refreshGitStats());
	pi.on("session_tree", async () => refreshGitStats());
}

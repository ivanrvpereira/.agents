/**
 * Custom footer: same as built-in, but adds context token count,
 * colors context usage (green <80k, yellow >80k, red >120k),
 * and shows git stats (modified, new, deleted, ahead/behind, stash).
 */
import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { execSync } from "node:child_process";
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

	pi.on("session_start", async (_event, ctx) => {
		refreshGitStats();

		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsub = footerData.onBranchChange(() => {
				refreshGitStats();
				tui.requestRender();
			});

			return {
				dispose: unsub,
				invalidate() {},
				render(width: number): string[] {
					// Token totals
					let totalInput = 0, totalOutput = 0, totalCacheRead = 0, totalCacheWrite = 0, totalCost = 0;
					for (const e of ctx.sessionManager.getEntries()) {
						if (e.type === "message" && e.message.role === "assistant") {
							const m = e.message as AssistantMessage;
							totalInput += m.usage.input;
							totalOutput += m.usage.output;
							totalCacheRead += m.usage.cacheRead;
							totalCacheWrite += m.usage.cacheWrite;
							totalCost += m.usage.cost.total;
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

					// Stats parts
					const parts: string[] = [];
					if (totalInput) parts.push(`↑${formatTokens(totalInput)}`);
					if (totalOutput) parts.push(`↓${formatTokens(totalOutput)}`);
					if (totalCacheRead) parts.push(`R${formatTokens(totalCacheRead)}`);
					if (totalCacheWrite) parts.push(`W${formatTokens(totalCacheWrite)}`);

					const usingOAuth = ctx.model ? ctx.modelRegistry.isUsingOAuth(ctx.model) : false;
					if (totalCost || usingOAuth) {
						parts.push(`$${totalCost.toFixed(3)}${usingOAuth ? " (sub)" : ""}`);
					}

					// Context display with token count and absolute thresholds
					const autoIndicator = isCompactionEnabled() ? " (auto)" : "";
					const contextDisplay = contextPercent === "?"
						? `?/${formatTokens(contextWindow)}${autoIndicator}`
						: `${formatTokens(contextTokens)}/${formatTokens(contextWindow)} ${contextPercent}%${autoIndicator}`;

					const ctxColor = contextTokens > 120_000 ? "error" : contextTokens > 80_000 ? "warning" : "success";
					parts.push(theme.fg(ctxColor, contextDisplay));

					let statsLeft = parts.join(" ");
					let statsLeftWidth = visibleWidth(statsLeft);
					if (statsLeftWidth > width) {
						statsLeft = truncateToWidth(statsLeft, width, "...");
						statsLeftWidth = visibleWidth(statsLeft);
					}

					// Right side: model + thinking
					let rightSide = ctx.model?.id || "no-model";
					if (ctx.model?.reasoning) {
						const level = pi.getThinkingLevel();
						rightSide = level === "off" ? `${rightSide} • thinking off` : `${rightSide} • ${level}`;
					}
					if (footerData.getAvailableProviderCount() > 1 && ctx.model) {
						const withProvider = `(${ctx.model.provider}) ${rightSide}`;
						if (statsLeftWidth + 2 + visibleWidth(withProvider) <= width) {
							rightSide = withProvider;
						}
					}

					const rightWidth = visibleWidth(rightSide);
					const totalNeeded = statsLeftWidth + 2 + rightWidth;
					let statsLine: string;
					if (totalNeeded <= width) {
						statsLine = statsLeft + " ".repeat(width - statsLeftWidth - rightWidth) + rightSide;
					} else {
						const avail = width - statsLeftWidth - 2;
						if (avail > 0) {
							const tr = truncateToWidth(rightSide, avail, "");
							statsLine = statsLeft + " ".repeat(Math.max(0, width - statsLeftWidth - visibleWidth(tr))) + tr;
						} else {
							statsLine = statsLeft;
						}
					}

					const dimLeft = theme.fg("dim", statsLeft);
					const dimRight = theme.fg("dim", statsLine.slice(statsLeft.length));
					const pwdLine = truncateToWidth(theme.fg("dim", pwd), width, theme.fg("dim", "..."));
					const lines = [pwdLine, dimLeft + dimRight];

					// Extension statuses
					const statuses = footerData.getExtensionStatuses();
					if (statuses.size > 0) {
						const statusLine = Array.from(statuses.entries())
							.sort(([a], [b]) => a.localeCompare(b))
							.map(([, t]) => sanitize(t))
							.join(" ");
						lines.push(truncateToWidth(statusLine, width, theme.fg("dim", "...")));
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

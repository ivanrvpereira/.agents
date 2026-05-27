import type { AssistantMessage, StopReason } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { execFileSync } from "node:child_process";

interface PiRuntimePayload {
	pid: number;
	ppid: number;
	sessionId: string;
	sessionFile?: string;
	cwd: string;
	sessionName?: string;
	ts: number;
}

type AgentStatus = "idle" | "running" | "tool-running" | "done" | "error" | "waiting" | "interrupted" | "stale";
type Tone = "neutral" | "info" | "success" | "warn" | "error";

interface AgentEventPayload {
	agent: "pi";
	status: AgentStatus;
	threadId: string;
	threadName?: string;
	tmuxSession?: string;
	projectDir: string;
	ts: number;
}

const DEFAULT_SERVER_PORT = 7391;
const HEARTBEAT_MS = 5_000;
const STATUS_SOURCE = "pi";

function hashServerKey(input: string): number {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash + input.charCodeAt(i) * (i + 1)) % 20_000;
	}
	return hash;
}

function resolveServerPort(): number {
	const explicit = Number.parseInt(process.env.OPENSESSIONS_PORT ?? "", 10);
	if (Number.isFinite(explicit) && explicit > 0) return explicit;

	const explicitKey = process.env.OPENSESSIONS_SERVER_KEY?.trim();
	if (explicitKey) return 17_000 + Number.parseInt(explicitKey, 10);

	const tmux = process.env.TMUX?.trim();
	if (tmux) {
		const socketPath = tmux.split(",", 1)[0];
		if (socketPath) return 17_000 + hashServerKey(socketPath);
	}

	return DEFAULT_SERVER_PORT;
}

function getServerUrl(): string {
	const explicit = process.env.OPENSESSIONS_URL;
	if (explicit) return explicit.replace(/\/+$/, "");
	return `http://127.0.0.1:${resolveServerPort()}`;
}

function getTmuxSession(): string | undefined {
	if (!process.env.TMUX) return undefined;
	try {
		const output = execFileSync("tmux", ["display-message", "-p", "#S"], {
			encoding: "utf8",
			timeout: 1_000,
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		return output || undefined;
	} catch {
		return undefined;
	}
}

function unrefTimer(timer: ReturnType<typeof setInterval>): void {
	if (typeof timer !== "object" || timer === null || !("unref" in timer)) return;
	const nodeTimer = timer as { unref?: () => void };
	nodeTimer.unref?.();
}

function shortName(name: string, max = 40): string {
	const normalized = name.replace(/[\r\n\t]/g, " ").replace(/ +/g, " ").trim();
	if (normalized.length <= max) return normalized;
	return `${normalized.slice(0, max - 1)}…`;
}

export default function opensessionsRuntime(pi: ExtensionAPI) {
	let heartbeat: ReturnType<typeof setInterval> | null = null;
	let current: Omit<PiRuntimePayload, "ts" | "sessionName"> | null = null;
	let tmuxSession = getTmuxSession();
	let lastTerminalStatus: "done" | "error" | "interrupted" | null = null;
	const activeTools = new Map<string, string>();

	function sessionName(ctx: ExtensionContext): string | undefined {
		return pi.getSessionName() ?? ctx.sessionManager.getSessionName();
	}

	function buildRuntimePayload(ctx: ExtensionContext): PiRuntimePayload {
		return {
			pid: process.pid,
			ppid: process.ppid,
			sessionId: ctx.sessionManager.getSessionId(),
			sessionFile: ctx.sessionManager.getSessionFile(),
			cwd: ctx.sessionManager.getCwd(),
			sessionName: sessionName(ctx),
			ts: Date.now(),
		};
	}

	function buildAgentEvent(ctx: ExtensionContext, status: AgentStatus): AgentEventPayload {
		return {
			agent: "pi",
			status,
			threadId: ctx.sessionManager.getSessionId(),
			threadName: sessionName(ctx),
			tmuxSession,
			projectDir: ctx.sessionManager.getCwd(),
			ts: Date.now(),
		};
	}

	async function post(path: string, body: unknown): Promise<void> {
		try {
			await fetch(`${getServerUrl()}${path}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body),
			});
		} catch {
			// opensessions may not be running yet; heartbeat and future events retry.
		}
	}

	function postAgentEvent(ctx: ExtensionContext, status: AgentStatus): void {
		void post("/api/agent-event", buildAgentEvent(ctx, status));
	}

	function setStatus(text: string | null, tone: Tone = "neutral"): void {
		if (!tmuxSession) return;
		void post("/set-status", { session: tmuxSession, text, tone });
	}

	function log(message: string, tone: Tone = "neutral"): void {
		if (!tmuxSession) return;
		void post("/log", { session: tmuxSession, message: shortName(message, 500), tone, source: STATUS_SOURCE });
	}

	function clearProgress(): void {
		if (!tmuxSession) return;
		void post("/set-progress", { session: tmuxSession, clear: true });
	}

	function setToolProgress(): void {
		if (!tmuxSession) return;
		if (activeTools.size === 0) {
			clearProgress();
			return;
		}
		void post("/set-progress", { session: tmuxSession, current: activeTools.size, label: "tools" });
	}

	function clearHeartbeat(): void {
		if (!heartbeat) return;
		clearInterval(heartbeat);
		heartbeat = null;
	}

	function startHeartbeat(ctx: ExtensionContext): void {
		clearHeartbeat();
		heartbeat = setInterval(() => {
			if (!current) {
				current = {
					pid: process.pid,
					ppid: process.ppid,
					sessionId: ctx.sessionManager.getSessionId(),
					sessionFile: ctx.sessionManager.getSessionFile(),
					cwd: ctx.sessionManager.getCwd(),
				};
			}
			void post("/api/runtime/pi/upsert", {
				...current,
				sessionName: sessionName(ctx),
				ts: Date.now(),
			} satisfies PiRuntimePayload);
		}, HEARTBEAT_MS);
		unrefTimer(heartbeat);
	}

	function markTerminal(ctx: ExtensionContext, stopReason: StopReason, errorMessage?: string): void {
		if (stopReason === "toolUse") return;

		if (stopReason === "aborted") {
			lastTerminalStatus = "interrupted";
			postAgentEvent(ctx, "interrupted");
			setStatus("Pi interrupted", "warn");
			log("Interrupted", "warn");
			clearProgress();
			return;
		}

		if (stopReason === "error") {
			lastTerminalStatus = "error";
			postAgentEvent(ctx, "error");
			setStatus("Pi error", "error");
			log(errorMessage ? `Error: ${errorMessage}` : "Error", "error");
			clearProgress();
			return;
		}

		lastTerminalStatus = "done";
		postAgentEvent(ctx, "done");
		setStatus("Pi done", "success");
		clearProgress();
	}

	pi.registerCommand("opensessions-refresh", {
		description: "Re-register this Pi session with opensessions",
		handler: async (_args, ctx) => {
			tmuxSession = getTmuxSession();
			const payload = buildRuntimePayload(ctx);
			current = {
				pid: payload.pid,
				ppid: payload.ppid,
				sessionId: payload.sessionId,
				sessionFile: payload.sessionFile,
				cwd: payload.cwd,
			};
			await post("/api/runtime/pi/upsert", payload);
			postAgentEvent(ctx, ctx.isIdle() ? "idle" : "running");
			setStatus(ctx.isIdle() ? "Pi idle" : "Pi running", "info");
			ctx.ui.notify(`opensessions refreshed: ${getServerUrl()}`, "info");
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		tmuxSession = getTmuxSession();
		const payload = buildRuntimePayload(ctx);
		current = {
			pid: payload.pid,
			ppid: payload.ppid,
			sessionId: payload.sessionId,
			sessionFile: payload.sessionFile,
			cwd: payload.cwd,
		};
		void post("/api/runtime/pi/upsert", payload);
		postAgentEvent(ctx, "idle");
		setStatus("Pi idle", "neutral");
		startHeartbeat(ctx);
	});

	pi.on("agent_start", async (_event, ctx) => {
		lastTerminalStatus = null;
		activeTools.clear();
		postAgentEvent(ctx, "running");
		setStatus("Pi running", "info");
	});

	pi.on("message_end", async (event, ctx) => {
		if (event.message.role !== "assistant") return;
		const message = event.message as AssistantMessage;
		markTerminal(ctx, message.stopReason, message.errorMessage);
	});

	pi.on("tool_execution_start", async (event, ctx) => {
		activeTools.set(event.toolCallId, event.toolName);
		postAgentEvent(ctx, "tool-running");
		setStatus(`Pi tool: ${shortName(event.toolName, 30)}`, "info");
		setToolProgress();
	});

	pi.on("tool_execution_end", async (event, ctx) => {
		activeTools.delete(event.toolCallId);
		if (event.isError) {
			postAgentEvent(ctx, "error");
			setStatus(`Pi tool failed: ${shortName(event.toolName, 24)}`, "error");
			setToolProgress();
			return;
		}

		if (activeTools.size > 0) {
			postAgentEvent(ctx, "tool-running");
			setStatus(`Pi tools running: ${activeTools.size}`, "info");
			setToolProgress();
			return;
		}

		postAgentEvent(ctx, "running");
		setStatus("Pi running", "info");
		clearProgress();
	});

	pi.on("agent_end", async (_event, ctx) => {
		activeTools.clear();
		if (lastTerminalStatus === "error") {
			postAgentEvent(ctx, "error");
			setStatus("Pi error", "error");
		} else if (lastTerminalStatus === "interrupted" || ctx.signal?.aborted) {
			postAgentEvent(ctx, "interrupted");
			setStatus("Pi interrupted", "warn");
		} else {
			postAgentEvent(ctx, "done");
			setStatus("Pi done", "success");
		}
		clearProgress();
	});

	pi.on("model_select", async (event) => {
		log(`Model: ${event.model.provider}/${event.model.id}`, "info");
	});

	pi.on("session_shutdown", async () => {
		clearHeartbeat();
		activeTools.clear();
		lastTerminalStatus = null;
		current = null;

		const cleanup: Promise<void>[] = [post("/api/runtime/pi/delete", { pid: process.pid })];
		if (tmuxSession) {
			cleanup.push(
				post("/set-status", { session: tmuxSession, text: null, tone: "neutral" }),
				post("/set-progress", { session: tmuxSession, clear: true }),
			);
		}
		await Promise.all(cleanup);
	});
}

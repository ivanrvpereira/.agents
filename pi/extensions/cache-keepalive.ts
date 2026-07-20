/**
 * Cache keepalive: keeps the Anthropic prompt cache warm across idle pauses.
 *
 * Why: pi requests 1h cache TTL (PI_CACHE_RETENTION=long → cache_control ttl "1h").
 * Anthropic refreshes the TTL on every cache hit at cache-read price (0.1x base),
 * while letting it expire means the next message rewrites the whole context at 2x.
 * A ping shortly before expiry costs ~5% of a cold resume.
 *
 * How: a pass-through tap on global fetch captures the exact wire bytes (URL,
 * headers, body) of the session's last main LLM request. When the session has
 * been idle for ~TTL-minus-margin, that request is replayed byte-identical with
 * stream:true and hard-aborted as soon as the `message_start` SSE event arrives —
 * before the model generates thinking/output. Billed: cache read of the full
 * context + a few output tokens. The session file is never touched.
 *
 * Byte-identity is load-bearing twice over:
 * - Any payload change (e.g. stripping `thinking` to allow max_tokens:1)
 *   invalidates the messages-level cache → the ping silently pays full price.
 * - On subscription OAuth, Anthropic fingerprints requests (headers AND body
 *   serialization) to classify Claude Code traffic (plan limits) vs third-party
 *   harness traffic (metered "extra usage"). Reconstructed requests — even
 *   semantically identical ones — get routed to extra usage and may be rejected.
 *   Only the captured wire bytes pass as plan usage. (Verified empirically.)
 *
 * Verification: reads usage.cache_read_input_tokens from message_start. If the
 * ping didn't actually hit the cache, keepalive auto-disables (fail-safe against
 * Anthropic changing cache semantics, as they did in March 2026).
 *
 * Anthropic-only: openai-codex models sit on an automatic ~5-10 min cache that
 * is always evicted within 1h and cannot be kept warm at a sane ping rate.
 *
 * Stops on two conditions:
 *   1. Session budget exhausted: max 24 keepalives per session (env-overridable).
 *   2. A ping that does not hit the cache → auto-disable; every outcome is also
 *      recorded to ~/.pi/agent/cache-keepalive-stats.json (see /keepalive stats).
 *
 * Controls:
 *   /keepalive [on|off|status|stats]  toggle / inspect (default on)
 *   PI_CACHE_KEEPALIVE=off            disable by default (keepalive is on unless set)
 *   PI_CACHE_KEEPALIVE_DELAY=<sec>    override ping delay
 *   PI_CACHE_KEEPALIVE_PINGS=<n>      max pings per session (default 24)
 *   PI_CACHE_KEEPALIVE_MIN_TOKENS=<n> skip small contexts (default 10000)
 */
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function debugLog(entry: Record<string, unknown>) {
	if (!process.env.PI_CACHE_KEEPALIVE_DEBUG) return;
	try {
		appendFileSync("/tmp/cache-keepalive-debug.jsonl", `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`);
	} catch {}
}

const STATUS_KEY = "cache-keepalive";
const ICON = "\x1b[31m\u2665\x1b[0m"; // red heart — keepalive = keeping the cache's heart beating
const ONE_HOUR_MS = 60 * 60_000;
const FIVE_MIN_MS = 5 * 60_000;

const MAX_PINGS = intEnv("PI_CACHE_KEEPALIVE_PINGS", 24);
const STATS_PATH = join(homedir(), ".pi", "agent", "cache-keepalive-stats.json");
const MAX_STAT_EVENTS = 100;
const MIN_TOKENS = intEnv("PI_CACHE_KEEPALIVE_MIN_TOKENS", 10_000);
const DELAY_OVERRIDE_MS = Number.isFinite(Number(process.env.PI_CACHE_KEEPALIVE_DELAY)) && process.env.PI_CACHE_KEEPALIVE_DELAY
	? Math.max(10, Number(process.env.PI_CACHE_KEEPALIVE_DELAY)) * 1000
	: null;

function intEnv(name: string, fallback: number): number {
	const raw = process.env[name];
	const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
	return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function fmtTime(epochMs: number): string {
	return new Date(epochMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtTokens(count: number): string {
	if (count < 1000) return `${count}`;
	if (count < 1_000_000) return `${Math.round(count / 1000)}k`;
	return `${(count / 1_000_000).toFixed(1)}M`;
}

interface Captured {
	model: any;
	ttlMs: number;
	estTokens: number;
}

interface PingResult {
	ok: boolean;
	cacheRead: number;
	status?: number;
	error?: string;
}

interface StatEvent {
	at: string;
	kind: "hit" | "miss" | "error";
	cacheRead: number;
	estTokens: number;
	model: string;
	session?: string;
	detail?: string;
}

interface Stats {
	pings: number;
	hits: number;
	misses: number;
	errors: number;
	tokensRefreshed: number;
	updatedAt?: string;
	events: StatEvent[];
}

function readStats(): Stats {
	try {
		const raw = JSON.parse(readFileSync(STATS_PATH, "utf-8"));
		return {
			pings: Number(raw.pings) || 0,
			hits: Number(raw.hits) || 0,
			misses: Number(raw.misses) || 0,
			errors: Number(raw.errors) || 0,
			tokensRefreshed: Number(raw.tokensRefreshed) || 0,
			updatedAt: raw.updatedAt,
			events: Array.isArray(raw.events) ? raw.events : [],
		};
	} catch {
		return { pings: 0, hits: 0, misses: 0, errors: 0, tokensRefreshed: 0, events: [] };
	}
}

function recordStat(event: StatEvent) {
	try {
		const stats = readStats();
		stats.pings++;
		if (event.kind === "hit") {
			stats.hits++;
			stats.tokensRefreshed += event.cacheRead;
		} else if (event.kind === "miss") {
			stats.misses++;
		} else {
			stats.errors++;
		}
		stats.updatedAt = event.at;
		stats.events = [event, ...stats.events].slice(0, MAX_STAT_EVENTS);
		mkdirSync(join(homedir(), ".pi", "agent"), { recursive: true });
		writeFileSync(STATS_PATH, JSON.stringify(stats, null, "\t"));
	} catch {
		// stats are best-effort; never let bookkeeping break the keepalive
	}
}

interface WireCapture {
	url: string;
	headers: Record<string, string>;
	body: string;
}

// Stored on globalThis so /reload'ed module instances share the same capture
// (the fetch tap is only installed once per process).
function getWire(): WireCapture | null {
	return ((globalThis as any).__cacheKeepaliveWire as WireCapture | undefined) ?? null;
}
function setWire(wire: WireCapture) {
	(globalThis as any).__cacheKeepaliveWire = wire;
}

// Intercept global fetch (pass-through) to capture the exact URL + wire headers
// pi's Anthropic SDK sends to /v1/messages. Reconstructing headers is not enough:
// Anthropic fingerprints requests (anthropic-beta set, user-agent, x-stainless-*)
// to classify traffic as Claude Code (plan limits) vs third-party harness (extra
// usage). The ping must be byte-identical in headers as well as payload.
function installFetchTap() {
	if ((globalThis as any).__cacheKeepaliveFetchTap) return;
	(globalThis as any).__cacheKeepaliveFetchTap = true;
	const original = globalThis.fetch;
	globalThis.fetch = async (input: any, init?: any) => {
		try {
			const url = typeof input === "string" ? input : (input?.url ?? String(input));
			if (
				typeof url === "string" &&
				url.includes("/v1/messages") &&
				!init?.__cacheKeepalivePing &&
				(globalThis as any).__cacheKeepaliveExpect === true
			) {
				const headers: Record<string, string> = {};
				const source = init?.headers ?? (typeof input === "object" ? input?.headers : undefined);
				if (source) {
					if (typeof source.forEach === "function") {
						source.forEach((v: string, k: string) => (headers[k.toLowerCase()] = v));
					} else if (Array.isArray(source)) {
						for (const [k, v] of source) headers[String(k).toLowerCase()] = String(v);
					} else {
						for (const [k, v] of Object.entries(source)) headers[k.toLowerCase()] = String(v);
					}
				}
				if (Object.keys(headers).length > 0 && typeof init?.body === "string") {
					setWire({ url, headers, body: init.body });
					(globalThis as any).__cacheKeepaliveExpect = false;
				}
			}
		} catch {}
		return original(input, init);
	};
}

export default function cacheKeepalive(pi: ExtensionAPI) {
	installFetchTap();
	let enabled = process.env.PI_CACHE_KEEPALIVE?.toLowerCase() !== "off";
	let autoDisabledReason: string | null = null;
	let captured: Captured | null = null;
	let lastCtx: ExtensionContext | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let nextPingAt = 0;
	let sessionPings = 0; // total keepalives this session (stop condition 1: cap)
	let lastCacheRead = 0;
	let lastPingAt = 0;

	function statBase(target: Captured): Omit<StatEvent, "kind" | "cacheRead"> {
		let session: string | undefined;
		try {
			session = lastCtx?.sessionManager.getSessionId();
		} catch {}
		return {
			at: new Date().toISOString(),
			estTokens: target.estTokens,
			model: String(target.model?.id ?? "?"),
			session,
		};
	}

	function setStatus(text: string | undefined) {
		try {
			lastCtx?.ui.setStatus(STATUS_KEY, text);
		} catch {
			// print/RPC modes may not support statuses; keepalive still works
		}
	}

	function cancelTimer() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function pingDelayMs(ttlMs: number): number {
		if (DELAY_OVERRIDE_MS !== null) return DELAY_OVERRIDE_MS;
		if (ttlMs >= ONE_HOUR_MS) {
			// 50min base + 0-4min jitter: inside the 1h TTL, non-robotic timing.
			return 50 * 60_000 + Math.floor(Math.random() * 4 * 60_000);
		}
		// 5m TTL: ping at ~4m15s + 0-20s jitter.
		return 255_000 + Math.floor(Math.random() * 20_000);
	}

	function arm() {
		cancelTimer();
		if (!enabled || !captured) return;
		if (captured.estTokens < MIN_TOKENS) {
			// Rewrite would be cheap; not worth pinging — but say so instead of
			// showing nothing, so "why is there no heart" is always answerable.
			setStatus(`${ICON} ctx ~${fmtTokens(captured.estTokens)}<${fmtTokens(MIN_TOKENS)} — skip`);
			return;
		}
		if (sessionPings >= MAX_PINGS) {
			const coldAt = (lastPingAt || Date.now()) + captured.ttlMs;
			setStatus(`${ICON} cap ${sessionPings}/${MAX_PINGS} · cold ~${fmtTime(coldAt)}`);
			return;
		}
		const delay = pingDelayMs(captured.ttlMs);
		nextPingAt = Date.now() + delay;
		timer = setTimeout(() => void firePing(), delay);
		// Never keep the process alive just for a keepalive.
		(timer as any).unref?.();
		const read = lastCacheRead > 0 ? `R${fmtTokens(lastCacheRead)} ` : "";
		setStatus(`${ICON} ${read}@${fmtTime(nextPingAt)} (${sessionPings}/${MAX_PINGS})`);
	}

	async function firePing() {
		timer = null;
		if (!enabled || !captured) return;
		setStatus(`${ICON} …`);
		const target = captured;
		let result: PingResult;
		try {
			result = await ping(target);
			if (!result.ok && result.status === 400 && strategy === "replay") {
				// Exact replays can be rejected/misclassified; retry as a continuation.
				strategy = "append";
				debugLog({ event: "strategy_fallback", to: "append" });
				result = await ping(target);
			}
		} catch (error) {
			result = { ok: false, cacheRead: 0, error: error instanceof Error ? error.message : String(error) };
		}
		if (captured !== target || !enabled) return; // a new turn or /keepalive off raced us
		lastPingAt = Date.now();

		if (result.ok) {
			// Stop condition 2: verify the ping actually hit the cache; ~0 reads on a
			// big context means the refresh semantics changed — stop paying for misses.
			if (result.cacheRead < Math.min(1024, target.estTokens / 2)) {
				enabled = false;
				autoDisabledReason = `cache miss (R${fmtTokens(result.cacheRead)} of ~${fmtTokens(target.estTokens)})`;
				recordStat({ ...statBase(target), kind: "miss", cacheRead: result.cacheRead });
				setStatus(`${ICON} MISS R${fmtTokens(result.cacheRead)} — keepalive off`);
				return;
			}
			sessionPings++;
			lastCacheRead = result.cacheRead;
			recordStat({ ...statBase(target), kind: "hit", cacheRead: result.cacheRead });
			arm();
			return;
		}

		recordStat({
			...statBase(target),
			kind: "error",
			cacheRead: 0,
			detail: `${result.status ?? ""} ${result.error ?? ""}`.trim().slice(0, 200),
		});
		if (result.status === 401 || result.status === 403) {
			enabled = false;
			autoDisabledReason = `auth error ${result.status}`;
			setStatus(`${ICON} auth ${result.status} — keepalive off`);
			return;
		}
		// Transient failure (5xx, 429, network): consume a ping slot and retry.
		sessionPings++;
		arm();
		const retry = timer ? ` · retry@${fmtTime(nextPingAt)}` : "";
		setStatus(`${ICON} failed (${result.status ?? result.error ?? "?"})${retry} (${sessionPings}/${MAX_PINGS})`);
	}

	// "replay": resend the exact last request (pure cache refresh, zero new input).
	// "append": same request plus a minimal trailing user message — the cached
	// prefix still fully hits, but the request reads as a normal continuation.
	// Anthropic appears to route exact replays on subscription OAuth to the
	// metered "extra usage" pool, so "append" is the fallback (and sticks once it works).
	let strategy: "replay" | "append" = "replay";

	async function ping(target: Captured): Promise<PingResult> {
		if (!lastCtx) return { ok: false, cacheRead: 0, error: "no context" };
		const auth = await lastCtx.modelRegistry.getApiKeyAndHeaders(target.model);
		if (!auth.ok) return { ok: false, cacheRead: 0, error: auth.error ?? "auth resolution failed" };

		const wire = getWire();
		if (!wire) return { ok: false, cacheRead: 0, error: "no wire headers captured" };

		const apiKey: string | undefined = auth.apiKey;
		const isOAuth = !!apiKey?.includes("sk-ant-oat");

		// Replay the captured wire headers byte-identical; only refresh auth
		// (OAuth tokens and header-delivered credentials rotate) and drop
		// hop-by-hop headers.
		const headers: Record<string, string> = { ...wire.headers, ...(auth.headers ?? {}) };
		delete headers["content-length"];
		delete headers.host;
		delete headers.connection;
		if (isOAuth && apiKey) {
			headers.authorization = `Bearer ${apiKey}`;
		} else if (apiKey) {
			headers["x-api-key"] = apiKey;
		} else if (!headers.authorization && !headers["x-api-key"] && !auth.headers) {
			return { ok: false, cacheRead: 0, error: "no API key" };
		}

		// Replay the exact wire bytes. For "append", parse and re-stringify with one
		// extra trailing user message — everything before it keeps the original
		// serialization, so the cached prefix is untouched.
		let body = wire.body;
		if (strategy === "append") {
			// Fail loudly: resending the unmodified body would repeat the exact
			// request that was just rejected, so a parse failure aborts the ping.
			let parsed: any;
			try {
				parsed = JSON.parse(wire.body);
			} catch (error) {
				const detail = error instanceof Error ? error.message : String(error);
				debugLog({ event: "append_parse_failed", detail });
				return { ok: false, cacheRead: 0, error: `append: wire body parse failed: ${detail}` };
			}
			if (!Array.isArray(parsed.messages)) {
				debugLog({ event: "append_parse_failed", detail: "wire body has no messages array" });
				return { ok: false, cacheRead: 0, error: "append: wire body has no messages array" };
			}
			parsed.messages = [...parsed.messages, { role: "user", content: [{ type: "text", text: "Wait." }] }];
			body = JSON.stringify(parsed);
		}
		debugLog({
			event: "ping_attempt",
			strategy,
			bodyHash: createHash("sha256").update(body).digest("hex").slice(0, 16),
			bodyLen: body.length,
			wireBodyLen: wire.body.length,
		});
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 120_000);
		(timeout as any).unref?.();
		try {
			const res = await fetch(wire.url, {
				method: "POST",
				headers,
				// Byte-identical payload; stream so we can abort before generation.
				body,
				signal: controller.signal,
				__cacheKeepalivePing: true,
			} as RequestInit);
			if (!res.ok || !res.body) {
				const text = await res.text().catch(() => "");
				debugLog({
					event: "ping_rejected",
					status: res.status,
					body: text.slice(0, 2000),
					isOAuth,
					sentHeaders: Object.keys(headers),
				});
				return { ok: false, cacheRead: 0, status: res.status, error: text.slice(0, 200) };
			}

			// Read SSE until message_start (carries input usage, emitted before any
			// generation), then hard-abort the connection.
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			try {
				while (buffer.length < 262_144) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const idx = buffer.indexOf('"message_start"');
					if (idx === -1) continue;
					const lineStart = buffer.lastIndexOf("data:", idx);
					const lineEnd = buffer.indexOf("\n", idx);
					if (lineStart === -1 || lineEnd === -1) continue; // event split across chunks
					try {
						const event = JSON.parse(buffer.slice(lineStart + 5, lineEnd).trim());
						const usage = event?.message?.usage ?? {};
						debugLog({ event: "ping_ok", usage });
						return { ok: true, cacheRead: Number(usage.cache_read_input_tokens) || 0 };
					} catch {
						continue; // partial JSON; keep reading
					}
				}
				return { ok: false, cacheRead: 0, error: "stream ended before message_start" };
			} finally {
				controller.abort();
				reader.cancel().catch(() => {});
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	// --- Event wiring ---------------------------------------------------------

	pi.on("before_provider_request", async (event, ctx) => {
		lastCtx = ctx;
		const model: any = ctx.model;
		if (model?.api !== "anthropic-messages" || !model?.baseUrl) return;
		let json: string;
		try {
			json = JSON.stringify(event.payload);
		} catch {
			return;
		}
		captured = {
			model,
			ttlMs: json.includes('"ttl":"1h"') ? ONE_HOUR_MS : FIVE_MIN_MS,
			estTokens: Math.round(json.length / 4),
		};
		// Arm the fetch tap: capture the wire bytes of exactly this request.
		(globalThis as any).__cacheKeepaliveExpect = true;
	});

	pi.on("agent_start", async (_event, ctx) => {
		lastCtx = ctx;
		cancelTimer();
		setStatus(undefined);
	});

	pi.on("agent_end", async (_event, ctx) => {
		lastCtx = ctx;
		lastCacheRead = 0;
		arm();
	});

	pi.on("session_start", async (_event, ctx) => {
		lastCtx = ctx;
		cancelTimer();
		captured = null;
		sessionPings = 0;
		lastCacheRead = 0;
		setStatus(undefined);
	});

	pi.on("session_shutdown", async () => {
		cancelTimer();
	});

	pi.registerCommand("keepalive", {
		description: "Toggle Anthropic prompt-cache keepalive (on|off|status)",
		getArgumentCompletions: (prefix: string) => {
			const options = ["on", "off", "status", "stats"].filter((o) => o.startsWith(prefix));
			return options.length > 0 ? options.map((o) => ({ value: o, label: o })) : null;
		},
		handler: async (args, ctx) => {
			lastCtx = ctx;
			const arg = args.trim().toLowerCase();

			if (arg === "status") {
				const lines = [
					`keepalive: ${enabled ? "on" : `off${autoDisabledReason ? ` (${autoDisabledReason})` : ""}`}`,
					`session pings: ${sessionPings}/${MAX_PINGS}`,
					timer ? `next ping: ${fmtTime(nextPingAt)}` : "next ping: none armed",
					lastCacheRead > 0 ? `last verified read: ${fmtTokens(lastCacheRead)} tokens` : "last verified read: n/a",
					captured
						? `captured: ~${fmtTokens(captured.estTokens)} tokens, TTL ${captured.ttlMs >= ONE_HOUR_MS ? "1h" : "5m"} (${captured.model.id})`
						: "captured: nothing yet (anthropic only)",
				];
				ctx.ui.notify(lines.join(" · "), "info");
				return;
			}

			if (arg === "stats") {
				const stats = readStats();
				const header = [
					`pings: ${stats.pings}`,
					`hits: ${stats.hits}`,
					`misses: ${stats.misses}`,
					`errors: ${stats.errors}`,
					`tokens refreshed: ${fmtTokens(stats.tokensRefreshed)}`,
					`updated: ${stats.updatedAt ?? "never"}`,
				].join(" · ");
				if (stats.events.length === 0) {
					ctx.ui.notify(`${header} · file: ${STATS_PATH}`, "info");
					return;
				}
				const rows = stats.events.map((e) => {
					const when = e.at.replace("T", " ").slice(0, 16);
					const extra = e.kind === "hit" ? `R${fmtTokens(e.cacheRead)}` : (e.detail ?? `R${fmtTokens(e.cacheRead)}`);
					return `${when}  ${e.kind.toUpperCase().padEnd(5)} ${extra}  ~${fmtTokens(e.estTokens)} ctx  ${e.model}`;
				});
				if (ctx.hasUI) {
					await ctx.ui.select(header, rows);
				} else {
					ctx.ui.notify(`${header}\n${rows.slice(0, 10).join("\n")}`, "info");
				}
				return;
			}

			const turnOn = arg === "on" ? true : arg === "off" ? false : !enabled;
			enabled = turnOn;
			if (enabled) {
				autoDisabledReason = null;
				arm();
				ctx.ui.notify(
					timer ? `keepalive on — next ping ${fmtTime(nextPingAt)}` : "keepalive on — arms after the next turn",
					"info",
				);
			} else {
				cancelTimer();
				setStatus(undefined);
				ctx.ui.notify("keepalive off", "info");
			}
		},
	});
}

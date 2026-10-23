# Persistent supervisor orchestration research

**As of 2026-10-20.** The research subagent inspected the implementation-orchestrator skill read-only and used web tools and `gh`. The runtime saved this report. The researcher did not change project source, settings, git state, or external resources, and did not launch further agents.

The parent independently fetched sources [1]–[4] and checked their dates and the claims about naming, context, asynchronous execution, and permission boundaries. The skill uses three unsuccessful repair rounds as its local default, not an evidence-backed optimum.

## Recommendation

Use a **persistent supervisor** above independent task-orchestrator sessions, with **bounded managed subagents inside each task**:

```text
Human
└── Persistent supervisor: priorities, delegated decisions, escalation, closure
    ├── Task orchestrator A → implement / review / fix / independently verify
    └── Task orchestrator B → implement / review / fix / independently verify
```

This is a **logical hierarchy over independently addressable sessions**, not a requirement that every session be a nested child process. Stateful asynchronous subagents can also provide that arrangement: lifecycle capabilities matter more than the “peer” versus “subagent” label.[3]

Recommend skill name **`supervisor`**, described as “persistent cross-task supervisor acting within the human’s recorded authority.” **`conductor`** is a reasonable local alias, but the inspected sources do not establish it as an industry standard.

## Evidence and freshness

Eight first-party sources were inspected. Two dated sources fall within the requested six-month window, both within three months. The April article narrowly misses six months; it is labeled accordingly. Living documentation is not presented as recently published evidence.

| Source | Date/status | Relevant evidence |
|---|---|---|
| **[1] [Claude Code: Week 32](https://code.claude.com/docs/en/whats-new/2026-w32)** | **August 3–7, 2026** | Introduces cross-session discovery and messaging in v2.1.224; messages transfer text, not conversation history or files. |
| **[2] [LangChain: Organizing Context in a Multi-Agent Harness](https://www.langchain.com/blog/organizing-context-in-a-multi-agent-harness)** | **September 8, 2026** | Supervisor pattern; isolated versus forked context; recommends isolated context for independent verifiers to avoid anchoring. |
| **[3] [LangChain: Running Subagents in the Background](https://www.langchain.com/blog/running-subagents-in-the-background)** | **April 16, 2026 — just outside six months** | Stateful remote subagents support start, inspect, update, cancel, and list operations while the supervisor remains available. |
| **[4] [Claude Code: Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)** | Undated living documentation | Delivery, idle notifications, permission boundaries, held/refused messages, and independent-session coordination. |
| **[5] [Claude Code: Agent teams](https://code.claude.com/docs/en/agent-teams)** | Undated living documentation; experimental feature | Lead/teammate model, shutdown requests, quality hooks, context costs, file conflicts, and recovery limitations. |
| **[6] [OpenAI: Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)** | Undated living documentation | Manager-as-tools retains responsibility for the final answer; handoffs transfer ownership to specialists. |
| **[7] [LangGraph supervisor README, pinned revision](https://github.com/langchain-ai/langgraph-supervisor-py/blob/731739c6d0407255523e3ff20c9b9044a10d8a2f/README.md)** | **March 2, 2026 revision — older foundation**; inspected through `gh` | Explicit supervisor-of-supervisors hierarchy. Maintainers now recommend implementing the supervisor pattern directly through tools for most uses. |
| **[8] [LangGraph: Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)** | Undated living documentation | Separates thread checkpoints from cross-thread stores; in-memory checkpoints do not survive restarts. |

**Naming:** “Supervisor,” “manager,” and “team lead” have direct first-party support.[2][5][6] “Hierarchical supervisor” accurately describes supervisor-of-supervisors composition.[7] “Coordinator” describes the function but does not specify authority or lifetime. None of these names alone implies permission to impersonate human approval.

## Persistent sessions versus nested workers

| Concern | Independent sessions + messaging | Nested managed subagents |
|---|---|---|
| **Human responsiveness** | Separate sessions can exchange findings and questions during work.[4] | Blocking inline calls can occupy the supervisor; asynchronous subagents remove that restriction.[3] |
| **Ownership** | Requires an explicit policy assigning task, decision, and closure authority. Messaging itself supplies no such policy.[4] | Manager-as-tools naturally preserves outer ownership; handoff is a different ownership choice.[6] |
| **Context overhead** | Independent contexts require concise briefs and updates; teams consume more tokens and coordination effort.[5] | Result summaries isolate detail. Forking can reduce repeated investigation, but can anchor reviewers.[2] |
| **Lifecycle** | Supports ongoing steering, but message delivery and idle status are not completion evidence.[4] | Convenient for bounded work; background lifetime and nesting depend on the harness.[5] |
| **Recovery** | Needs durable task records and reconciliation with actual live sessions. | Parent resumption does not necessarily restore children: Claude Code explicitly does not restore in-process teammates through `/resume`.[5] |
| **Concurrent writes** | Separate sessions do not prevent conflicting edits. | Neither does nesting. Claude Code recommends distinct file ownership.[5] |

**Important qualifications**

- LangChain’s blocking-inline discussion describes that execution model, not a universal restriction on all subagents. Its own asynchronous model supports independent process/state and mid-task steering.[3]
- Claude Code teams are not a transparent implementation of an arbitrary hierarchy: no nested teams, one team per session, and no background subagents from in-process teammates.[5]
- **Peer messages cannot approve permission prompts or supply human consent.** They also cannot legitimately relay a denied action to another session to bypass permissions.[4][5]
- Persistent conversation identity is not durable execution. Thread checkpoints, cross-task memory, and workspace artifacts need deliberate storage and recovery policies.[8]

## Concrete rules for the supervisor skill

The following are **recommendations**, not claims of a standardized protocol.

1. **Separate authority from execution.**  
   The supervisor owns cross-task priorities, answers within recorded authorization, escalation, and closure decisions. Task orchestrators own implementation details, worker delegation, review, repair, verification, and authorized commits. Do not turn the supervisor into another implementation worker.

2. **Represent the human only within explicit bounds.**  
   Record approved scope, acceptance criteria, safety restrictions, permitted environments, budgets, and reserved decisions. Answer questions from those records; cite the relevant decision. Escalate missing permission, conflicting requirements, changed user-visible behavior, or scope expansion. Never manufacture consent or bypass native permission prompts.[4]

3. **Use a small question protocol.**  
   Require `task_id`, `request_id`, question, options, recommendation, blocking reason, and relevant evidence. Return a correlated answer or `awaiting-human`. Suspend the affected branch while blocked; unrelated authorized work may continue. Avoid interpreting silence as approval.

4. **Separate turn completion, task completion, and session closure.**  
   Use explicit states such as `running`, `awaiting-supervisor`, `awaiting-human`, `ready-for-closure`, and `closed`. Idle only means no current turn/queued work in the documented messaging implementation—not verified success.[4]

5. **Make closure evidence-gated.**  
   The task orchestrator submits acceptance coverage, final revision, review dispositions, independent verification commands/results, required commits, baseline exceptions, and unresolved items. The supervisor checks this packet before authorizing closure. Missing required verification means **blocked**, not passed. Persist the outcome and confirm child work is stopped or transferred before shutdown.

6. **Bound repair without weakening checks.**  
   Suggested initial policy: escalate after **two unsuccessful repair cycles for the same failure**, or earlier when time/cost limits expire. This number is a local operating default, not an evidence-backed optimum. Require the failed attempts, changed hypotheses, remaining risk, and proposed next action. Permission failures should not trigger repeated retries.

7. **Maintain durable records, not an ever-growing transcript.**  
   Keep a supervisor-owned registry of task/session IDs, state, decisions, budgets, ownership, pending requests, and evidence references. Keep implementation detail in each task’s progress record. Use durable storage where crash recovery matters; RAM-only checkpoints are insufficient.[8]

8. **Preserve independent review context.**  
   Give reviewers requirements, the final diff, relevant artifacts, and acceptance criteria—not the implementer’s persuasive narrative. Supply focused context to implementers; use inherited context only where it materially avoids rediscovery.[2]

9. **Control writers across tasks, not just within them.**  
   Assign repository/worktree/file ownership before dispatch. Prefer isolated worktrees; otherwise require disjoint ownership. Serialize integration and shared progress updates, then rerun checks on the combined result. Task-claim locking is not protection against overlapping source edits.[5]

10. **Recover by reconciliation, not blind replay.**  
    After interruption, inspect actual sessions, processes, diffs, commits, and pending side effects before resuming or replacing workers. Reissue unanswered requests with stable IDs; do not repeat destructive actions merely because an acknowledgment is missing. Treat message delivery as fallible: documented messages can be held, refused, or expire.[4]

## Fit with the existing implementation-orchestrator

The [local skill](../skills/on-demand/implementation-orchestrator/SKILL.md) already assigns implementation, separate Standards/Spec review, fresh-worker fixes, independent verification, progress recording, and per-step commits to the task orchestrator.

**Preserve that ownership.** Add only the outer contract:

- supervisor-directed questions, with human escalation when authority is insufficient;
- cross-task writer coordination and repair budgets;
- a durable task registry and closure handshake.

Do not relax the existing rule that worker reports are claims rather than verification evidence.

## Gaps

The inspected sources support the architectural components, **not** a validated end-to-end “human representative across multiple tasks” standard. They do not establish an optimal repair count, guarantee exactly-once messaging, or demonstrate that this particular harness can restore and close independent sessions reliably.

Before relying on the design, test its actual messaging, pause/resume, child-lifetime, permission, and shutdown behavior. A skill can specify authority and closure policy; enforcement requires corresponding runtime capabilities.
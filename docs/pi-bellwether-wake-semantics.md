# Pi Bellwether: waits, wakes, and restart limits

Source pin: `joelhooks/pi-bellwether@cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d` (package 1.5.0 supplied by parent). All paths and line numbers below refer to that commit. Inspection used cached source only. No dependencies, project code, or tests were executed.

## Confirmed fit

**The watch registry returns a receipt immediately, not after worker completion.** `start()` creates an actor and returns its receipt. The socket wait and agent probe run in the background. This supports a conversational manager that continues other work while waits remain active. It requires a long-lived interactive or RPC Pi process, not print or JSON mode. [`src/watch.ts:424–469, 682–729, 817–857`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/watch.ts#L424)

**Notification and agent wake are distinct.** `notify` calls the notification callback without a model turn. `silent` sends neither. The default `agent` mode sends a displayed follow-up with `triggerTurn: true`. Cancellation, shutdown, and obsolete generations suppress new watch-settlement delivery. The extension separately flushes already-held wakes directly during shutdown. An idle/done receipt also stays quiet if the target session already reported to its owner. [`src/watch.ts:623–679, 847`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/watch.ts#L623)

## Busy manager and ordering

The wake router batches receipts while its `isBusy()` callback reports busy. After an idle signal, it waits 250 milliseconds and checks again. A five-minute maximum hold flushes even without idle. Delivery first offers the batch to pi-until’s arbiter. Without synchronous acceptance, it sends a direct Pi follow-up. Timers do not keep the process alive, so this is not durable delivery across crashes. [`src/wake.ts:15–20, 104–174`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/wake.ts#L104)

**Lifecycle caveat:** the extension directly sets its busy flag on `agent_start` and clears it on `agent_end` (`extensions/pi-bellwether.ts:2177–2184`). An integration test also releases the batch through `agent_end`. This is not an `agent_settled` guarantee or proof that queued work from other extensions is exhausted. The 250-millisecond window is batching, not proof of global quiescence. [`src/wake.ts:19`; `src/pi-bellwether.test.ts:695–705`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/pi-bellwether.test.ts#L695)

Same-turn prompts gate new agent-state watches until prompt proof resolves. A relevant unproven prompt fails the watch instead of matching stale idle state. Proof of delivery is not proof of task completion. [`src/prompt-gate.ts:69–91`; `src/watch.ts:488–517`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/prompt-gate.ts#L69)

## Cancellation and recovery

The registry owns watch cancellation and aborts its background requests when actors stop. It does not send a worker-stop command through this path. The router can withdraw a held wake by key, but this does not recall a delivered message. [`src/watch.ts:424–469, 752–756, 805–815`; `src/wake.ts:163–173`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/watch.ts#L752)

Reload restoration differs from process restart. Integration tests assert automatic restoration after reload, but no automatic restoration on fresh startup after quit. The latter requires `/herdr-resume`. These are inspected assertions, not executed results. [`src/pi-bellwether.test.ts:400–454, 2166–2212`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/pi-bellwether.test.ts#L2166)

Suspension stores active inputs and absolute deadlines. Restoration uses remaining time. Manual restart recovery excludes expired waits. The newest suspension entry is authoritative, and malformed data restores nothing. This does not establish crash recovery without a saved suspension. [`src/watch.ts:776–803`; `src/suspension.ts:135–169`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/suspension.ts#L135)

**Boundary:** receipts explicitly state that observed agent state does not prove task completion. These files establish neither successful worker completion nor human takeover. [`src/watch.ts:330–334`](https://github.com/joelhooks/pi-bellwether/blob/cf9cdb6363fc2fc10f253f5e256c5ebfbab5560d/src/watch.ts#L330)

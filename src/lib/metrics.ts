/**
 * Lightweight in-memory metrics recorder.
 *
 * Exposed on `/v1/health` so operators can see routing throughput, latency,
 * and model selection distribution at a glance without a dashboard. Kept
 * deliberately simple:
 *
 * - No external dependencies (Prometheus, StatsD, OpenTelemetry) — that
 *   decision should be made when we actually need metrics outside a
 *   single serverless region.
 * - Counters and a rolling latency window per instance. Numbers are local
 *   to each serverless invocation process, so they reflect recent activity
 *   in the current warm instance rather than global state. That is the
 *   correct trade-off for an in-memory recorder; persistence belongs in
 *   a real time-series store.
 * - Single responsibility: record and read. No alerting, no sampling, no
 *   percentile sketches beyond a simple sorted-window p95 — this keeps
 *   the hot path O(1) and the read path O(n log n) on a bounded window.
 */

const LATENCY_WINDOW_SIZE = 256;

/**
 * Approximate percentile from an unsorted window. Returns 0 when the window
 * is empty. We sort a copy so the recorded order is preserved and the
 * calculation is independent of record frequency.
 */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx] ?? 0;
}

class RoutingMetrics {
  private totalCalls = 0;
  private errorCount = 0;
  private latencySum = 0;
  private readonly latencyWindow: number[] = [];
  private readonly modelSelections = new Map<string, number>();
  private readonly providerSelections = new Map<string, number>();
  private readonly startedAt = Date.now();

  /**
   * Record a successful routing decision.
   *
   * @param durationMs - Total wall-clock time spent in `route()`.
   * @param selection  - The chosen model and provider.
   */
  recordRoutingDecision(
    durationMs: number,
    selection: { modelId: string; provider: string }
  ): void {
    this.totalCalls += 1;
    this.latencySum += durationMs;
    this.latencyWindow.push(durationMs);
    if (this.latencyWindow.length > LATENCY_WINDOW_SIZE) {
      this.latencyWindow.shift();
    }
    this.modelSelections.set(
      selection.modelId,
      (this.modelSelections.get(selection.modelId) ?? 0) + 1
    );
    this.providerSelections.set(
      selection.provider,
      (this.providerSelections.get(selection.provider) ?? 0) + 1
    );
  }

  /**
   * Record a routing failure. Bumps error count and total so error rate
   * reflects real traffic.
   */
  recordRoutingError(): void {
    this.totalCalls += 1;
    this.errorCount += 1;
  }

  /**
   * Snapshot the current metrics in a shape suitable for returning from
   * `/v1/health`. Always includes derived values (averages, percentiles,
   * error rate) so clients don't have to recompute them.
   */
  snapshot(): {
    totalCalls: number;
    errorCount: number;
    errorRate: number;
    avgDecisionTimeMs: number;
    p95DecisionTimeMs: number;
    modelSelectionFrequency: Record<string, number>;
    providerSelectionFrequency: Record<string, number>;
    uptimeSeconds: number;
  } {
    const successfulCalls = Math.max(this.totalCalls - this.errorCount, 0);
    const avg =
      successfulCalls > 0
        ? Number((this.latencySum / successfulCalls).toFixed(2))
        : 0;
    return {
      totalCalls: this.totalCalls,
      errorCount: this.errorCount,
      errorRate:
        this.totalCalls > 0
          ? Number((this.errorCount / this.totalCalls).toFixed(4))
          : 0,
      avgDecisionTimeMs: avg,
      p95DecisionTimeMs: Number(percentile(this.latencyWindow, 95).toFixed(2)),
      modelSelectionFrequency: Object.fromEntries(this.modelSelections),
      providerSelectionFrequency: Object.fromEntries(this.providerSelections),
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }
}

/**
 * Process-wide metrics singleton. All routes share the same instance so
 * counts and latencies accumulate across endpoints.
 */
export const routingMetrics = new RoutingMetrics();

/**
 * Auth-specific metrics. Kept separate from routing metrics so operators
 * can distinguish "ADE is failing to route" from "ADE is rejecting
 * traffic at the door" at a glance. A spike in `failureCount` — especially
 * in `unknown_key_id` or `invalid_caller_secret` — is the canonical
 * signal of either a key-rotation mismatch or an active probing attempt.
 */
class AuthMetrics {
  private successCount = 0;
  private failureCount = 0;
  private readonly failuresByReason = new Map<string, number>();

  recordSuccess(): void {
    this.successCount += 1;
  }

  recordFailure(reason: string): void {
    this.failureCount += 1;
    this.failuresByReason.set(
      reason,
      (this.failuresByReason.get(reason) ?? 0) + 1
    );
  }

  snapshot(): {
    successCount: number;
    failureCount: number;
    failureRate: number;
    failuresByReason: Record<string, number>;
  } {
    const total = this.successCount + this.failureCount;
    return {
      successCount: this.successCount,
      failureCount: this.failureCount,
      failureRate:
        total > 0 ? Number((this.failureCount / total).toFixed(4)) : 0,
      failuresByReason: Object.fromEntries(this.failuresByReason),
    };
  }
}

export const authMetrics = new AuthMetrics();

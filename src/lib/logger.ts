/**
 * Structured JSON logger for the Araviel Decision Engine.
 *
 * Every log record is a single JSON line on stdout (stderr for warn/error),
 * which is how Vercel captures and indexes logs. Keeping lines strict JSON
 * also makes them trivial to forward to a third-party aggregator later.
 *
 * Usage:
 *   const log = logger.child({ route: "route", requestId });
 *   log.info("Routed request", { model: "gpt-4o-mini", durationMs: 12 });
 *   log.error("Routing failed", err);
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
  requestId?: string;
  route?: string;
}

interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  status?: number;
}

const IS_TEST = process.env.NODE_ENV === "test";
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  if (IS_TEST && level !== "error") return false;
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[LOG_LEVEL];
}

function serializeError(err: unknown): SerializedError | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    const extras = err as Error & { code?: string; status?: number };
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: extras.code,
      status: extras.status,
    };
  }
  return {
    name: "UnknownError",
    message: typeof err === "string" ? err : JSON.stringify(err),
  };
}

function emit(
  level: LogLevel,
  message: string,
  context: LogContext | undefined,
  err?: unknown
): void {
  if (!shouldLog(level)) return;
  const record = {
    timestamp: new Date().toISOString(),
    level,
    msg: message,
    ...(context ?? {}),
    ...(err !== undefined ? { error: serializeError(err) } : {}),
  };
  const line = `${JSON.stringify(record)}\n`;
  if (level === "error" || level === "warn") {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext, err?: unknown): void;
  error(message: string, err?: unknown, context?: LogContext): void;
  child(bindings: LogContext): Logger;
}

function buildLogger(bindings: LogContext = {}): Logger {
  return {
    debug(message, context) {
      emit("debug", message, { ...bindings, ...context });
    },
    info(message, context) {
      emit("info", message, { ...bindings, ...context });
    },
    warn(message, context, err) {
      emit("warn", message, { ...bindings, ...context }, err);
    },
    error(message, err, context) {
      emit("error", message, { ...bindings, ...context }, err);
    },
    child(newBindings) {
      return buildLogger({ ...bindings, ...newBindings });
    },
  };
}

export const logger: Logger = buildLogger();

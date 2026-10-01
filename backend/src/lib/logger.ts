type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private context: LogContext = {};

  withContext(ctx: LogContext): Logger {
    const child = new Logger();
    child.context = { ...this.context, ...ctx };
    return child;
  }

  private write(
    level: LogLevel,
    msg: string,
    extra?: Record<string, unknown>,
  ): void {
    const entry = {
      level,
      msg,
      ts: new Date().toISOString(),
      service: "pecunia-api",
      ...this.context,
      ...extra,
    };
    if (level === "error" || level === "warn") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  debug(msg: string, extra?: Record<string, unknown>): void {
    this.write("debug", msg, extra);
  }
  info(msg: string, extra?: Record<string, unknown>): void {
    this.write("info", msg, extra);
  }
  warn(msg: string, extra?: Record<string, unknown>): void {
    this.write("warn", msg, extra);
  }
  error(msg: string, extra?: Record<string, unknown>): void {
    this.write("error", msg, extra);
  }
}

export const logger = new Logger();

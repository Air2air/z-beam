// app/utils/logger.ts
// Simple logger utility for scripts and development

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'performance';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }

  performance(message: string, duration: number, context?: LogContext): void {
    const perfContext = { ...context, durationMs: duration };
    const emoji = duration > 1000 ? '🐌' : '⚡';
    console.log(`${emoji} ${this.formatMessage('performance', message, perfContext)}`);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };

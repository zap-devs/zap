/**
 * Centralized logging utility for the Zap application
 * Provides configurable logging levels and minimal output
 */

enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO; // Default to INFO level

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    private shouldLog(level: LogLevel): boolean {
        return level <= this.logLevel;
    }

    public error(message: string, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }

    public warn(message: string, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    public info(message: string, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    public debug(message: string, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
}

// Export singleton instance and LogLevel enum
export const logger = Logger.getInstance();
export { LogLevel };

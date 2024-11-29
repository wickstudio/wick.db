import { LogLevel } from './types';

/**
 * Logger class with support for multiple log levels.
 */
export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  /**
   * Logs a debug message.
   * @param message - The message to log.
   */
  public debug(message: string): void {
    if (['debug'].includes(this.level)) {
      console.debug(`[WickDB][DEBUG]: ${message}`);
    }
  }

  /**
   * Logs an informational message.
   * @param message - The message to log.
   */
  public info(message: string): void {
    if (['debug', 'info'].includes(this.level)) {
      console.log(`[WickDB][INFO]: ${message}`);
    }
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   */
  public warn(message: string): void {
    if (['debug', 'info', 'warn'].includes(this.level)) {
      console.warn(`[WickDB][WARN]: ${message}`);
    }
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   */
  public error(message: string): void {
    if (['debug', 'info', 'warn', 'error'].includes(this.level)) {
      console.error(`[WickDB][ERROR]: ${message}`);
    }
  }
}
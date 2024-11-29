/**
 * Options for configuring the database.
 */
export interface DBOptions {
  dbPath?: string;
  logLevel?: LogLevel;
  tableName?: string;
}

/**
 * Supported log levels.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

/**
 * Represents a data entry in the database.
 */
export interface DataEntry {
  key: string;
  value: any;
  ttl?: number | null;
}

/**
 * Supported mathematical operations.
 */
export type MathOperator = 'add' | 'subtract' | 'multiply' | 'divide';

/**
 * Event callback types for database events.
 */
export interface WickDBEvents {
  set: (key: string, value: any) => void;
  delete: (key: string) => void;
  clear: () => void;
}

/**
 * Row structure for a single key-value retrieval.
 */
export interface GetRow {
  value: string;
  ttl?: number | null;
}

/**
 * Row structure for multiple key-value retrievals.
 */
export interface DataRow {
  key: string;
  value: any;
  ttl?: number | null;
}
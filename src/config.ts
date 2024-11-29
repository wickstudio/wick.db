import { DBOptions, LogLevel } from './types';
import { DEFAULT_DB_PATH, DEFAULT_LOG_LEVEL, DEFAULT_TABLE } from './constants';

/**
 * Configuration class for WickDB.
 * Handles default values and user-provided options.
 */
export class Config {
  public dbPath: string;
  public logLevel: LogLevel;
  public tableName: string;

  constructor(options?: DBOptions) {
    this.dbPath = options?.dbPath || DEFAULT_DB_PATH;
    this.logLevel = options?.logLevel || DEFAULT_LOG_LEVEL;
    this.tableName = options?.tableName || DEFAULT_TABLE;
  }
}
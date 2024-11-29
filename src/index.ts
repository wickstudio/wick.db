import { Database } from './database/index';
import { Config } from './config';
import { Logger } from './logger';
import { DBOptions } from './types';

/**
 * Main class for WickDB.
 * Extends the Database class with configuration and logging.
 */
export class WickDB extends Database {
  constructor(options?: DBOptions) {
    const config = new Config(options);
    const logger = new Logger(config.logLevel);
    super(config, logger);
  }
}

export default WickDB;
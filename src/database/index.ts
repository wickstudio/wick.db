import BetterSQLite3 from 'better-sqlite3';
import { Logger } from '../logger';
import { Config } from '../config';
import { validateKey, serialize, deserialize, setNestedValue, getNestedValue } from '../utils';
import { WickDBEmitter } from '../events';
import { WickDBError, KeyNotFoundError, InvalidValueTypeError } from '../errors';
import { GetRow, DataRow, MathOperator } from '../types';

/**
 * Main database class extending event emitter.
 * Handles all CRUD operations and database interactions.
 */
export class Database extends WickDBEmitter {
  private db: BetterSQLite3.Database;
  private logger: Logger;
  private tableName: string;
  private cache: Map<string, { value: any; ttl: number | null }>;

  constructor(config: Config, logger: Logger) {
    super();
    this.db = new BetterSQLite3(config.dbPath);
    this.logger = logger;
    this.tableName = config.tableName;
    this.cache = new Map();
    this.initialize();
  }

  /**
   * Initializes the database table.
   */
  private initialize(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        key TEXT PRIMARY KEY,
        value TEXT,
        ttl INTEGER
      )`;
    this.db.prepare(createTableQuery).run();
    this.logger.info('Database initialized.');
  }

  /**
   * Sets a value in the database.
   * @example
   * db.set('username', 'Alice');
   * @param key - The key to set.
   * @param value - The value to associate with the key.
   * @param ttl - Optional time-to-live in milliseconds.
   */
  public set(key: string, value: any, ttl?: number): void {
    validateKey(key);
    const expiresAt = ttl ? Date.now() + ttl : null;
    const stmt = this.db.prepare(`
      REPLACE INTO ${this.tableName} (key, value, ttl)
      VALUES (?, ?, ?)
    `);
    stmt.run(key, serialize(value), expiresAt);
    
    this.cache.set(key, { value, ttl: expiresAt });
    this.logger.debug(`Set key "${key}" with value.`);
    this.emit('set', key, value);
  }

  /**
   * Retrieves a value from the database.
   * @example
   * const username = db.get('username');
   * @param key - The key to retrieve.
   * @returns The associated value or null if not found or expired.
   */
  public get(key: string): any {
    validateKey(key);

    if (this.cache.has(key)) {
      const cached = this.cache.get(key)!;
      if (cached.ttl && Date.now() > cached.ttl) {
        this.cache.delete(key);
        this.delete(key);
        return null;
      }
      this.logger.debug(`Cache hit for key "${key}".`);
      return cached.value;
    }

    const stmt = this.db.prepare(`
      SELECT value, ttl FROM ${this.tableName}
      WHERE key = ?
    `);
    const row = stmt.get(key) as GetRow | undefined;
    if (!row) {
      return null;
    }
    if (row.ttl && Date.now() > row.ttl) {
      this.delete(key);
      return null;
    }
    const value = deserialize(row.value);
    this.cache.set(key, { value, ttl: row.ttl ?? null });
    this.logger.debug(`Retrieved key "${key}".`);
    return value;
  }

  /**
   * Checks if a key exists in the database.
   * @param key - The key to check.
   * @returns True if the key exists, false otherwise.
   */
  public has(key: string): boolean {
    validateKey(key);
    const value = this.get(key);
    return value !== null;
  }

  /**
   * Deletes a key from the database.
   * @param key - The key to delete.
   */
  public delete(key: string): void {
    validateKey(key);
    const stmt = this.db.prepare(`
      DELETE FROM ${this.tableName}
      WHERE key = ?
    `);
    stmt.run(key);
    this.cache.delete(key); 
    this.logger.debug(`Deleted key "${key}".`);
    this.emit('delete', key);
  }

  /**
   * Retrieves all key-value pairs from the database.
   * @returns An array of all data rows.
   */
  public all(): DataRow[] {
    const stmt = this.db.prepare(`
      SELECT key, value, ttl FROM ${this.tableName}
    `);
    const rows = stmt.all() as DataRow[];
    const data: DataRow[] = [];
    for (const row of rows) {
      if (row.ttl && Date.now() > row.ttl) {
        this.delete(row.key);
        continue;
      }
      const value = deserialize(row.value);
      data.push({
        key: row.key,
        value: value,
        ttl: row.ttl ?? null,
      });
      this.cache.set(row.key, { value, ttl: row.ttl ?? null }); 
    }
    this.logger.debug('Retrieved all keys.');
    return data;
  }

  /**
   * Clears all data from the database.
   */
  public clear(): void {
    const stmt = this.db.prepare(`
      DELETE FROM ${this.tableName}
    `);
    stmt.run();
    this.cache.clear();
    this.logger.debug('Cleared all data.');
    this.emit('clear');
  }

  /**
   * Performs a mathematical operation on a stored number.
   * @param key - The key whose value to operate on.
   * @param operator - The math operation to perform.
   * @param value - The number to use in the operation.
   */
  public math(key: string, operator: MathOperator, value: number): void {
    validateKey(key);
    const currentValue = this.get(key);
    if (currentValue === null) {
      throw new KeyNotFoundError(key);
    }
    if (typeof currentValue !== 'number') {
      throw new InvalidValueTypeError('number');
    }
    let newValue: number;
    switch (operator) {
      case 'add':
        newValue = currentValue + value;
        break;
      case 'subtract':
        newValue = currentValue - value;
        break;
      case 'multiply':
        newValue = currentValue * value;
        break;
      case 'divide':
        newValue = currentValue / value;
        break;
      default:
        throw new WickDBError(`Invalid math operator "${operator}".`);
    }
    this.set(key, newValue);
    this.logger.debug(`Performed math operation "${operator}" on key "${key}".`);
  }

  /**
   * Adds a number to a stored number.
   * @param key - The key of the number.
   * @param value - The number to add.
   */
  public add(key: string, value: number): void {
    this.math(key, 'add', value);
  }

  /**
   * Subtracts a number from a stored number.
   * @param key - The key of the number.
   * @param value - The number to subtract.
   */
  public subtract(key: string, value: number): void {
    this.math(key, 'subtract', value);
  }

  /**
   * Appends an element to an array stored in the database.
   * @param key - The key of the array.
   * @param element - The element to append.
   */
  public push(key: string, element: any): void {
    validateKey(key);
    let arr = this.get(key);
    if (arr === null) {
      arr = [];
    }
    if (!Array.isArray(arr)) {
      throw new InvalidValueTypeError('array');
    }
    arr.push(element);
    this.set(key, arr);
    this.logger.debug(`Pushed element to array at key "${key}".`);
  }

  /**
   * Removes an element from an array stored in the database.
   * @param key - The key of the array.
   * @param element - The element to remove.
   */
  public pull(key: string, element: any): void {
    validateKey(key);
    let arr = this.get(key);
    if (!Array.isArray(arr)) {
      throw new InvalidValueTypeError('array');
    }
    arr = arr.filter((el) => el !== element);
    this.set(key, arr);
    this.logger.debug(`Pulled element from array at key "${key}".`);
  }

  /**
   * Retrieves all keys that start with a given prefix.
   * @param prefix - The prefix to search for.
   * @returns An array of matching data rows.
   */
  public startsWith(prefix: string): DataRow[] {
    const stmt = this.db.prepare(`
      SELECT key, value, ttl FROM ${this.tableName}
      WHERE key LIKE ?
    `);
    const rows = stmt.all(`${prefix}%`) as DataRow[];
    const data: DataRow[] = [];
    for (const row of rows) {
      if (row.ttl && Date.now() > row.ttl) {
        this.delete(row.key);
        continue;
      }
      const value = deserialize(row.value);
      data.push({
        key: row.key,
        value: value,
        ttl: row.ttl ?? null,
      });
      this.cache.set(row.key, { value, ttl: row.ttl ?? null }); 
    }
    this.logger.debug(`Retrieved keys starting with "${prefix}".`);
    return data;
  }

  /**
   * Fetches a value from the database (alias for get).
   * @param key - The key to fetch.
   * @returns The associated value or null.
   */
  public fetch(key: string): any {
    return this.get(key);
  }

  /**
   * Retrieves all data as an object.
   * @returns An object with all key-value pairs.
   */
  public getAll(): Record<string, any> {
    const data = this.all();
    const result: Record<string, any> = {};
    for (const item of data) {
      result[item.key] = item.value;
    }
    return result;
  }

  /**
   * Deletes all data from the database (alias for clear).
   */
  public deleteAll(): void {
    this.clear();
  }

  /**
   * Sets a property of an object stored in the database.
   * @param key - The key of the object.
   * @param propPath - The dot-notated path of the property.
   * @param value - The value to set.
   */
  public setProp(key: string, propPath: string, value: any): void {
    validateKey(key);
    let obj = this.get(key);
    if (typeof obj !== 'object' || obj === null) {
      obj = {};
    }
    setNestedValue(obj, propPath, value);
    this.set(key, obj);
    this.logger.debug(`Set property "${propPath}" of key "${key}".`);
  }

  /**
   * Gets a property of an object stored in the database.
   * @param key - The key of the object.
   * @param propPath - The dot-notated path of the property.
   * @returns The value at the specified property path.
   */
  public getProp(key: string, propPath: string): any {
    validateKey(key);
    const obj = this.get(key);
    if (typeof obj !== 'object' || obj === null) {
      return undefined;
    }
    const value = getNestedValue(obj, propPath);
    this.logger.debug(`Got property "${propPath}" of key "${key}".`);
    return value;
  }

  /**
   * Sets multiple key-value pairs in the database.
   * @param entries - An array of key-value pairs.
   */
  public bulkSet(entries: { key: string; value: any; ttl?: number }[]): void {
    const insert = this.db.prepare(`
      REPLACE INTO ${this.tableName} (key, value, ttl)
      VALUES (@key, @value, @ttl)
    `);
    const transaction = this.db.transaction((entries: { key: string; value: any; ttl?: number }[]) => {
      for (const entry of entries) {
        validateKey(entry.key);
        const expiresAt = entry.ttl ? Date.now() + entry.ttl : null;
        insert.run({
          key: entry.key,
          value: serialize(entry.value),
          ttl: expiresAt,
        });
        this.cache.set(entry.key, { value: entry.value, ttl: expiresAt });
      }
    });
    transaction(entries);
    this.logger.info(`Bulk set ${entries.length} entries.`);
  }

  /**
   * Deletes multiple keys from the database.
   * @param keys - An array of keys to delete.
   */
  public bulkDelete(keys: string[]): void {
    const del = this.db.prepare(`
      DELETE FROM ${this.tableName}
      WHERE key = ?
    `);
    const transaction = this.db.transaction((keys: string[]) => {
      for (const key of keys) {
        validateKey(key);
        del.run(key);
        this.cache.delete(key); 
      }
    });
    transaction(keys);
    this.logger.info(`Bulk deleted ${keys.length} keys.`);
  }
}
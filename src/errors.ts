/**
 * Base class for WickDB errors.
 */
export class WickDBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WickDBError';
  }
}

/**
 * Error thrown when a key is not found.
 */
export class KeyNotFoundError extends WickDBError {
  constructor(key: string) {
    super(`Key "${key}" not found in the database.`);
    this.name = 'KeyNotFoundError';
  }
}

/**
 * Error thrown when an invalid key is provided.
 */
export class InvalidKeyError extends WickDBError {
  constructor() {
    super('Invalid key provided. Key must be a non-empty string.');
    this.name = 'InvalidKeyError';
  }
}

/**
 * Error thrown when a value is of an unexpected type.
 */
export class InvalidValueTypeError extends WickDBError {
  constructor(expectedType: string) {
    super(`Invalid value type. Expected ${expectedType}.`);
    this.name = 'InvalidValueTypeError';
  }
}
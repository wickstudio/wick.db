import { InvalidKeyError } from './errors';

/**
 * Validates a key to ensure it is a non-empty string.
 * @param key - The key to validate.
 * @throws {InvalidKeyError} If the key is invalid.
 */
export function validateKey(key: string): void {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new InvalidKeyError();
  }
}

/**
 * Serializes a value to a JSON string.
 * @param value - The value to serialize.
 * @returns The serialized string.
 */
export function serialize(value: any): string {
  return JSON.stringify(value);
}

/**
 * Deserializes a JSON string to a value.
 * @param value - The JSON string to deserialize.
 * @returns The deserialized value.
 */
export function deserialize(value: string): any {
  return JSON.parse(value);
}

/**
 * Sets a nested value in an object given a dot-notated path.
 * @param obj - The object to modify.
 * @param path - The dot-notated path (e.g., 'user.name').
 * @param value - The value to set.
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  while (keys.length > 1) {
    const key = keys.shift()!;
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[0]] = value;
}

/**
 * Gets a nested value from an object given a dot-notated path.
 * @param obj - The object to query.
 * @param path - The dot-notated path (e.g., 'user.name').
 * @returns The value at the specified path, or undefined.
 */
export function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null || !(key in current)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}
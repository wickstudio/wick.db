const Database = require('./database');
const { isValidKey, isSerializable } = require('./utils');

class WickDB {
  constructor(dbFilePath) {
    this.db = new Database(dbFilePath);
  }

  async set(key, value) {
    if (!isValidKey(key) || !isSerializable(value)) {
      throw new Error('Invalid key or value.');
    }
    await this.db.set(key, value);
    console.log(`Data set for key: ${key}`);
  }

  async get(key) {
    if (!isValidKey(key)) {
      throw new Error('Invalid key.');
    }
    return await this.db.get(key);
  }

  async delete(key) {
    if (!isValidKey(key)) {
      throw new Error('Invalid key.');
    }
    await this.db.delete(key);
  }

  async all() {
    return await this.db.getAll();
  }

  async clear() {
    await this.db.clear();
  }

  async update(key, value) {
    if (!isValidKey(key)) {
      throw new Error('Invalid key.');
    }
    if (!isSerializable(value)) {
      throw new Error('Invalid value.');
    }
    await this.db.update(key, value);
  }
}

module.exports = WickDB;

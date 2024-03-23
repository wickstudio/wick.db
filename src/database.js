const fs = require('fs');
const path = require('path');

class Database {
  constructor(dbFilePath = 'wick.json') {
    this.dbFilePath = path.resolve(dbFilePath);
    this._initializeDatabase();
  }

  _initializeDatabase() {
    if (!fs.existsSync(this.dbFilePath)) {
      fs.writeFileSync(this.dbFilePath, JSON.stringify({}));
    }
  }

  _readData() {
    const json = fs.readFileSync(this.dbFilePath, 'utf8');
    return JSON.parse(json);
  }

  _writeData(data) {
    fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  }

  set(key, value) {
    const data = this._readData();
    data[key] = value;
    this._writeData(data);
  }

  get(key) {
    const data = this._readData();
    return data[key] || null;
  }

  delete(key) {
    const data = this._readData();
    if (key in data) {
      delete data[key];
      this._writeData(data);
      return true;
    }
    return false;
  }

  getAll() {
    return this._readData();
  }

  clear() {
    this._writeData({});
  }

  update(key, value) {
    const data = this._readData();
    if (!(key in data)) {
      throw new Error(`Key ${key} does not exist.`);
    }
    data[key] = value;
    this._writeData(data);
  }
}

module.exports = Database;

const Database = require('../src/database');
const fs = require('fs').promises;
const path = require('path');

const testDbPath = path.join(__dirname, 'wick.json');

async function deleteTestDb() {
  try {
    await fs.unlink(testDbPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error deleting test database: ${err}`);
    }
  }
}

describe('Database', () => {
  let db;

  beforeAll(async () => {
    await deleteTestDb();
    db = new Database(testDbPath);
  });

  afterAll(async () => {
    await deleteTestDb();
  });

  test('set and get a value', async () => {
    const key = 'test';
    const value = 'value';
    await db.set(key, value);
    const fetchedValue = await db.get(key);
    expect(fetchedValue).toBe(value);
  });

  test('delete a key-value pair', async () => {
    const key = 'deleteTest';
    const value = 'toDelete';
    await db.set(key, value);
    await db.delete(key);
    const fetchedValue = await db.get(key)
    expect(fetchedValue).toBeNull();
  });

});

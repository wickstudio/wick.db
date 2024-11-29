import WickDB from '../src/index';

describe('WickDB', () => {
  let db: WickDB;

  beforeEach(() => {
    db = new WickDB({ dbPath: ':memory:' });
  });

  test('set and get a key-value pair', () => {
    db.set('testKey', 'testValue');
    expect(db.get('testKey')).toBe('testValue');
  });

  test('has method', () => {
    db.set('existKey', 'value');
    expect(db.has('existKey')).toBe(true);
    expect(db.has('nonExistKey')).toBe(false);
  });

  test('delete a key', () => {
    db.set('deleteKey', 'deleteValue');
    db.delete('deleteKey');
    expect(db.get('deleteKey')).toBeNull();
  });

  test('retrieve all keys', () => {
    db.set('key1', 'value1');
    db.set('key2', 'value2');
    const allData = db.all();
    expect(allData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'key1', value: 'value1' }),
        expect.objectContaining({ key: 'key2', value: 'value2' }),
      ])
    );
  });

  test('math operations', () => {
    db.set('numberKey', 10);
    db.math('numberKey', 'add', 5);
    expect(db.get('numberKey')).toBe(15);
  });

  test('array push and pull', () => {
    db.set('arrayKey', [1, 2, 3]);
    db.push('arrayKey', 4);
    expect(db.get('arrayKey')).toEqual([1, 2, 3, 4]);
    db.pull('arrayKey', 2);
    expect(db.get('arrayKey')).toEqual([1, 3, 4]);
  });

  test('data expiration (TTL)', async () => {
    db.set('ttlKey', 'tempValue', 100);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const value = db.get('ttlKey');
    expect(value).toBeNull();
  });

  test('startsWith method', () => {
    db.set('user_1', 'Alice');
    db.set('user_2', 'Bob');
    db.set('admin_1', 'Charlie');
    const users = db.startsWith('user_');
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'user_1', value: 'Alice' }),
        expect.objectContaining({ key: 'user_2', value: 'Bob' }),
      ])
    );
  });
});

describe('WickDB Additional Features', () => {
  let db: WickDB;

  beforeEach(() => {
    db = new WickDB({ dbPath: ':memory:' });
  });

  test('setProp and getProp methods', () => {
    db.set('user', { name: 'Alice' });
    db.setProp('user', 'age', 30);
    expect(db.getProp('user', 'age')).toBe(30);
    expect(db.get('user')).toEqual({ name: 'Alice', age: 30 });
  });

  test('add and subtract methods', () => {
    db.set('count', 10);
    db.add('count', 5);
    expect(db.get('count')).toBe(15);
    db.subtract('count', 3);
    expect(db.get('count')).toBe(12);
  });

  test('getAll method', () => {
    db.set('key1', 'value1');
    db.set('key2', 'value2');
    const allData = db.getAll();
    expect(allData).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  test('bulkSet and bulkDelete methods', () => {
    db.bulkSet([
      { key: 'bulk1', value: 'value1' },
      { key: 'bulk2', value: 'value2' },
    ]);
    expect(db.get('bulk1')).toBe('value1');
    expect(db.get('bulk2')).toBe('value2');

    db.bulkDelete(['bulk1', 'bulk2']);
    expect(db.get('bulk1')).toBeNull();
    expect(db.get('bulk2')).toBeNull();
  });
});
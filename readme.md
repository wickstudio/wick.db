<img src="https://media.wickdev.me/aBZf8efySd.png" alt="WickDB Logo" width="350" />

# WickDB

**WickDB** is a powerful, easy-to-use, and feature-rich SQLite-based key-value database for Node.js, written in TypeScript. Developed by **Wick Studio**, WickDB offers seamless data management with minimal setup, making it the perfect choice for developers looking to integrate a lightweight database into their applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1061971978845700176.svg?logo=discord&logoColor=white)](https://discord.gg/wicks)
[![GitHub Repo](https://img.shields.io/github/repo-size/wickstudio/wick.db.svg)](https://github.com/wickstudio/wick.db)
[![npm version](https://img.shields.io/npm/v/wick.db.svg)](https://www.npmjs.com/package/wick.db)

---

## 📚 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [API Reference](#api-reference)
  - [set](#setkey-string-value-any-ttl-number-void)
  - [get](#getkey-string-any)
  - [has](#haskey-string-boolean)
  - [delete](#deletekey-string-void)
  - [all](#alldatarow)
  - [clear](#clearvoid)
  - [math](#mathkey-string-operator-mathoperator-value-number-void)
  - [add](#addkey-string-value-number-void)
  - [subtract](#subtractkey-string-value-number-void)
  - [push](#pushkey-string-element-any-void)
  - [pull](#pullkey-string-element-any-void)
  - [setProp](#setpropkey-string-proppath-string-value-any-void)
  - [getProp](#getpropkey-string-proppath-string-any)
  - [bulkSet](#bulksetentries-key-string-value-any-ttl-number-void-void)
  - [bulkDelete](#bulkdeletekeys-string-void)
  - [startsWith](#startswithprefix-string-datarow)
- [Events](#events)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [Advanced Operations](#advanced-operations)
  - [Integrating with a Discord Bot](#integrating-with-a-discord-bot)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)
- [Connect with Us](#connect-with-us)

---

## 🌟 Introduction

WickDB is a lightweight yet powerful key-value store built on top of SQLite, designed for Node.js applications. It offers an intuitive API, making it easy to store and retrieve data without the overhead of setting up a full-fledged database. Whether you're building a small project or a large-scale application, WickDB provides the flexibility and performance you need.

---

## 🌟 Features

- **Simple API**: Effortless methods for common database operations.
- **Advanced Operations**: Supports array manipulation, math operations, data expiration (TTL), and nested property management.
- **Bulk Operations**: Efficient methods for setting and deleting multiple entries at once.
- **Event Emitter**: Listen to database events for reactive programming.
- **TypeScript Support**: Written in TypeScript with comprehensive type definitions.
- **Lightweight**: Minimal dependencies and a small footprint.
- **Persistent Storage**: Data is stored locally using SQLite, ensuring persistence across restarts.
- **Customizable Logging**: Multiple log levels to suit your debugging and monitoring needs.
- **Secure**: Handles data serialization and deserialization securely.
- **Performance Optimized**: Efficient data handling with in-memory caching for high-speed operations.

---

## 🛠 Installation

Install WickDB via NPM:

```bash
npm install wick.db better-sqlite3
```

Or using Yarn:

```bash
yarn add wick.db better-sqlite3
```

---

## ⚡ Quick Start

```typescript
import WickDB from 'wick.db';

const db = new WickDB({ logLevel: 'info' });

// Set a value
db.set('username', 'Wick');

// Get a value
const username = db.get('username');
console.log('Username:', username); // Output: Username: Wick

// Delete a value
db.delete('username');

// Perform math operations
db.set('score', 10);
db.math('score', 'add', 5); // score is now 15
console.log('Score:', db.get('score')); // Output: Score: 15

// Use shorthand math methods
db.add('score', 5); // score is now 20
db.subtract('score', 10); // score is now 10
console.log('Updated Score:', db.get('score')); // Output: Updated Score: 10

// Work with arrays
db.set('items', ['apple']);
db.push('items', 'banana'); // items: ['apple', 'banana']
db.pull('items', 'apple');  // items: ['banana']
console.log('Items:', db.get('items')); // Output: Items: ['banana']

// Manage nested properties
db.set('user', { name: 'Wick' });
db.setProp('user', 'age', 30);
const age = db.getProp('user', 'age');
console.log('User Age:', age); // Output: User Age: 30

// Bulk operations
db.bulkSet([
  { key: 'bulk1', value: 'value1' },
  { key: 'bulk2', value: 'value2' },
]);

db.bulkDelete(['bulk1', 'bulk2']);

// Use event listeners
db.on('set', (key, value) => {
  console.log(`Key "${key}" was set to`, value);
});

db.set('eventKey', 'eventValue'); // Triggers the 'set' event

// Handle data expiration (TTL)
db.set('tempKey', 'tempValue', 5000); // Expires in 5 seconds

// Retrieve keys starting with a prefix
db.set('user_1', 'Wick');
db.set('user_2', 'Studio');
const users = db.startsWith('user_');
console.log('Users:', users);

// Clear the database
db.clear();
```

---

## 🛠 Configuration Options

When initializing WickDB, you can provide an optional configuration object:

```typescript
const db = new WickDB({
  dbPath: './data/my-database.db', // Default: '.wick.db'
  logLevel: 'debug',               // Default: 'info'
  tableName: 'my_table',           // Default: 'data'
});
```

- **`dbPath`**: The file path for the SQLite database.
- **`logLevel`**: Sets the logging level. Options are `'debug'`, `'info'`, `'warn'`, `'error'`, `'none'`.
- **`tableName`**: Sets a custom table name for data storage.

---

## 📖 API Reference

### `set(key: string, value: any, ttl?: number): void`

Sets a value for a given key. Optionally, you can provide a TTL (time-to-live) in milliseconds.

**Parameters:**

- `key`: The key under which the value will be stored.
- `value`: The value to store. Can be any serializable data.
- `ttl` (optional): Time in milliseconds after which the key expires.

**Example:**

```typescript
db.set('session_token', 'abc123', 60000); // Expires in 1 minute
```

### `get(key: string): any`

Retrieves the value associated with the given key. Returns `null` if the key doesn't exist or has expired.

**Parameters:**

- `key`: The key to retrieve.

**Example:**

```typescript
const token = db.get('session_token');
```

### `has(key: string): boolean`

Checks if a key exists in the database.

**Parameters:**

- `key`: The key to check.

**Example:**

```typescript
if (db.has('user_id')) {
  // Do something
}
```

### `delete(key: string): void`

Deletes the key-value pair from the database.

**Parameters:**

- `key`: The key to delete.

**Example:**

```typescript
db.delete('tempKey');
```

### `all(): DataRow[]`

Retrieves all key-value pairs from the database.

**Returns:**

- An array of `DataRow` objects containing `key`, `value`, and optional `ttl`.

**Example:**

```typescript
const allData = db.all();
```

### `clear(): void`

Clears all data from the database.

**Example:**

```typescript
db.clear();
```

### `math(key: string, operator: MathOperator, value: number): void`

Performs a mathematical operation on a stored number.

**Parameters:**

- `key`: The key whose value to operate on.
- `operator`: The operation to perform (`'add'`, `'subtract'`, `'multiply'`, `'divide'`).
- `value`: The number to use in the operation.

**Example:**

```typescript
db.math('balance', 'subtract', 50);
```

### `add(key: string, value: number): void`

Adds a number to a stored number. Shorthand for `math(key, 'add', value)`.

**Parameters:**

- `key`: The key of the number.
- `value`: The number to add.

**Example:**

```typescript
db.add('score', 10);
```

### `subtract(key: string, value: number): void`

Subtracts a number from a stored number. Shorthand for `math(key, 'subtract', value)`.

**Parameters:**

- `key`: The key of the number.
- `value`: The number to subtract.

**Example:**

```typescript
db.subtract('score', 5);
```

### `push(key: string, element: any): void`

Appends an element to an array stored in the database. If the key doesn't exist, it creates a new array.

**Parameters:**

- `key`: The key of the array.
- `element`: The element to append.

**Example:**

```typescript
db.push('favorite_fruits', 'apple');
```

### `pull(key: string, element: any): void`

Removes an element from an array stored in the database.

**Parameters:**

- `key`: The key of the array.
- `element`: The element to remove.

**Example:**

```typescript
db.pull('favorite_fruits', 'banana');
```

### `setProp(key: string, propPath: string, value: any): void`

Sets a property of an object stored in the database using dot notation.

**Parameters:**

- `key`: The key of the object.
- `propPath`: The dot-notated path of the property (e.g., `'address.city'`).
- `value`: The value to set.

**Example:**

```typescript
db.setProp('user', 'address.city', 'New York');
```

### `getProp(key: string, propPath: string): any`

Gets a property of an object stored in the database using dot notation.

**Parameters:**

- `key`: The key of the object.
- `propPath`: The dot-notated path of the property.

**Example:**

```typescript
const city = db.getProp('user', 'address.city');
```

### `bulkSet(entries: { key: string; value: any; ttl?: number }[]): void`

Sets multiple key-value pairs in the database efficiently.

**Parameters:**

- `entries`: An array of objects containing `key`, `value`, and optional `ttl`.

**Example:**

```typescript
db.bulkSet([
  { key: 'item1', value: 'value1' },
  { key: 'item2', value: 'value2', ttl: 3000 },
]);
```

### `bulkDelete(keys: string[]): void`

Deletes multiple keys from the database efficiently.

**Parameters:**

- `keys`: An array of keys to delete.

**Example:**

```typescript
db.bulkDelete(['item1', 'item2']);
```

### `startsWith(prefix: string): DataRow[]`

Retrieves all key-value pairs where the key starts with the specified prefix.

**Parameters:**

- `prefix`: The prefix to search for.

**Example:**

```typescript
const users = db.startsWith('user_');
```

---

## Events

WickDB extends Node.js's `EventEmitter` class, allowing you to listen for database events.

**Supported Events:**

- `'set'`: Emitted when a key is set.
- `'delete'`: Emitted when a key is deleted.
- `'clear'`: Emitted when the database is cleared.

**Example:**

```typescript
db.on('set', (key, value) => {
  console.log(`Key "${key}" was set to`, value);
});

db.on('delete', (key) => {
  console.log(`Key "${key}" was deleted.`);
});

db.on('clear', () => {
  console.log('Database was cleared.');
});
```

---

## 📝 Examples

### **Basic Usage**

```typescript
import WickDB from 'wick.db';

const db = new WickDB();

// Storing data
db.set('user:1', { name: 'Wick', age: 30 });

// Retrieving data
const user = db.get('user:1');
console.log(user.name); // Output: Wick

// Checking existence
if (db.has('user:1')) {
  console.log('User exists');
}

// Deleting data
db.delete('user:1');
```

### **Advanced Operations**

#### **Nested Properties**

```typescript
// Setting nested properties
db.set('settings', {});
db.setProp('settings', 'theme.color', 'dark');
db.setProp('settings', 'notifications.email', true);

// Getting nested properties
const themeColor = db.getProp('settings', 'theme.color');
console.log('Theme Color:', themeColor); // Output: Theme Color: dark
```

#### **Bulk Operations**

```typescript
// Bulk setting data
db.bulkSet([
  { key: 'product:1', value: { name: 'Laptop', price: 999 } },
  { key: 'product:2', value: { name: 'Phone', price: 499 } },
]);

// Bulk deleting data
db.bulkDelete(['product:1', 'product:2']);
```

#### **Math Operations**

```typescript
// Incrementing a value
db.set('counter', 10);
db.add('counter', 5); // counter is now 15
db.subtract('counter', 3); // counter is now 12
console.log('Counter:', db.get('counter')); // Output: Counter: 12
```

### **Integrating with a Discord Bot**

Here's how you might integrate WickDB into a Discord bot using `discord.js`:

```javascript
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { WickDB } = require('wick.db');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const db = new WickDB();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!set')) {
    const args = message.content.split(' ');
    const key = args[1];
    const value = args.slice(2).join(' ');
    db.set(`${message.author.id}_${key}`, value);
    message.channel.send(`Set ${key} to ${value}.`);
  }

  if (message.content.startsWith('!get')) {
    const args = message.content.split(' ');
    const key = args[1];
    const value = db.get(`${message.author.id}_${key}`);
    message.channel.send(`Value for ${key}: ${value || 'Not found'}`);
  }

  if (message.content === '!leaderboard') {
    const allData = db.all();
    const users = allData.filter((entry) => entry.key.startsWith('points_'));
    const embed = new EmbedBuilder().setTitle('Leaderboard');

    for (const entry of users) {
      const userId = entry.key.replace('points_', '');
      const user = await client.users.fetch(userId).catch(() => null);
      if (user) {
        embed.addFields({ name: user.username, value: `${entry.value} points`, inline: true });
      }
    }

    message.channel.send({ embeds: [embed] });
  }
});

client.login('YOUR_DISCORD_BOT_TOKEN');
```

---

## 💡 Best Practices

- **Error Handling**: Always wrap database operations in try-catch blocks to handle potential errors.
- **Data Validation**: Validate data before storing to prevent issues with serialization/deserialization.
- **Performance**: Utilize bulk operations and in-memory caching for high-frequency operations.
- **Backup**: Regularly back up your database file, especially if data integrity is critical.
- **Security**: Ensure sensitive data is encrypted if necessary, and manage access appropriately.
- **Modular Design**: Structure your application to separate database logic from business logic for maintainability.
- **Logging**: Use appropriate log levels to monitor your application without overwhelming your logs.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to **WickDB**, please follow these steps:

1. **Fork the Repository**: Click the [Fork](https://github.com/wickstudio/wick.db/fork) button at the top right of the repository page.
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/wickstudio/wick.db.git
   ```
3. **Create a New Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Your Changes**: Implement your feature or fix.
5. **Commit Your Changes**:
   ```bash
   git commit -am 'Add a new feature'
   ```
6. **Push to the Branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**: Go to the original repository and click on "Compare & pull request".

Please ensure your code follows the project's coding standards and passes all tests. For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

WickDB is released under the [MIT License](https://opensource.org/licenses/MIT).

---

## 🌐 Connect with Us

- **Discord**: [Join our community](https://discord.gg/wicks)
- **GitHub**: [Visit our repository](https://github.com/wickstudio)
- **Website**: [Wick Studio](https://wick-studio.com/)

---

© 2025 [Wick Studio](https://github.com/wickstudio)

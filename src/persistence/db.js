//var sqlite3 = require('sqlite3');
const { Client } = require('pg');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

/*
mkdirp.sync('./var/db');

var db = new sqlite3.Database('./var/db/todos.db');

db.serialize(function() {
  // create the database schema for the todos app
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB \
  )");
  
  db.run("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title TEXT NOT NULL, \
    completed INTEGER \
  )");
  
  // create an initial user (username: alice, password: letmein)
  var salt = crypto.randomBytes(16);
  db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    'alice',
    crypto.pbkdf2Sync('letmein', salt, 310000, 32, 'sha256'),
    salt
  ]);
});

module.exports = db;
*/

let client;

async function init() {
    const host = process.env.POSTGRES_HOST;
    const user = process.env.POSTGRES_USER;
    const database = process.env.POSTGRES_DB;
    const password = process.env.POSTGRES_PASSWORD;

    client = new Client({
        host,
        user,
        password,
        database,
    });

    return client.connect().then(async () => {
        console.log(`Connected to postgres db at host`, host);
        // Run the SQL instruction to create the table if it does not exist
        //await client.query('CREATE TABLE IF NOT EXISTS product_list (id varchar(36), url varchar(255), created_at timestamptz default current_timestamp)');

        await client.query("CREATE TABLE IF NOT EXISTS users ( \
                            id INTEGER PRIMARY KEY, \
                            username TEXT UNIQUE, \
                            hashed_password varchar, \
                            salt varchar \
                          )");
        console.log('Connected to db and created table product_list if it did not exist');
    }).catch(err => {
        console.error('Unable to connect to the database:', err);
    });
}

// Get all items from the table
async function getItems() {
  return client.query('SELECT * FROM product_list').then(res => {
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      completed: row.completed
    }));
  }).catch(err => {
    console.error('Unable to get items:', err);
  });
}


// End the connection
async function teardown() {
  return client.end().then(() => {
    console.log('Client ended');
  }).catch(err => {
    console.error('Unable to end client:', err);
  });
}
  
// Get one item by id from the table
async function getItem(id) {
    return client.query('SELECT * FROM product_list WHERE id = $1', [id]).then(res => {
      return res.rows.length > 0 ? res.rows[0] : null;
    }).catch(err => {
      console.error('Unable to get item:', err);
    });
}
  
// Store one item in the table
async function storeItem(item) {
    return client.query('INSERT INTO product_list(id, url) VALUES($1, $2)', [item.id, item.url]).then(() => {
      console.log('Stored item:', item);
    }).catch(err => {
      console.error('Unable to store item:', err);
    });
}
  
// Update one item by id in the table
async function updateItem(id, item) {
    return client.query('UPDATE product_list SET url = $1 WHERE id = $2', [item.url, id]).then(() => {
      console.log('Updated item:', item);
    }).catch(err => {
      console.error('Unable to update item:', err);
    });
}
  
// Remove one item by id from the table
async function removeItem(id) {
    return client.query('DELETE FROM product_list WHERE id = $1', [id]).then(() => {
      console.log('Removed item:', id);
    }).catch(err => {
      console.error('Unable to remove item:', err);
    });
}
  
module.exports = {
  init,
  teardown,
  getItems,
  getItem,
  storeItem,
  updateItem,
  removeItem,
};


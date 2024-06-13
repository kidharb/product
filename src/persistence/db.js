const { Client } = require('pg');
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

        console.log('Creating users table if it does not exists');
        await client.query("CREATE TABLE IF NOT EXISTS users ( \
                            id SERIAL PRIMARY KEY, \
                            username TEXT UNIQUE, \
                            hashed_password varchar(100) \
                          )");
        console.log('Creating todos table if it does not exist');
        await client.query("CREATE TABLE IF NOT EXISTS todos ( \
                            id SERIAL PRIMARY KEY, \
                            owner_id INTEGER NOT NULL, \
                            title varchar(100) NOT NULL, \
                            completed INTEGER \
                          )");
        console.log('Enabling pgcrypto extension in database');
        await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
        //console.log('Creating user alice');
        //await client.query("UPSERT INTO users (username, hashed_password) VALUES ('alice', crypt('letmein', gen_salt('bf')))");
    }).catch(err => {
        console.error('Unable to connect to the database:', err);
    });
}

async function signin(username, password, cb) {
  client.query('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) { return cb(null, false, { message: 'Incorrect username or password.'   }); }
  client.query("SELECT id FROM users WHERE username = ? AND password = crypt(? , password)", [ username, password ]);
})}








/*      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, row); */

// Get all items from the table
async function signup(req, res, signup) {
    if (err) { return next(err); }
    client.query("INSERT INTO users (username, hashed_password) VALUES (?, crypt(req.body.password, gen_salt('bf')))", [
      req.body.username
    ]);
}
  
// Get all items from the table

module.exports = {
  init,
  signin,
  signup,
};


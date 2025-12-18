const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

console.log('Users:');
db.all('SELECT * FROM users', [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.table(rows);
  }
});

console.log('Messages:');
db.all('SELECT messages.id, messages.text, users.username FROM messages JOIN users ON messages.user_id = users.id', [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.table(rows);
  }
  db.close();
});
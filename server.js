const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    // Insert admin user if not exists
    db.get('SELECT * FROM users WHERE username = ?', ['xiaoming'], (err, row) => {
      if (!row) {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['xiaoming', '123']);
      }
    });
  }
});

// Routes
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.json({ id: this.lastID, username });
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (row) {
      res.json({ id: row.id, username: row.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.get('/messages', (req, res) => {
  db.all('SELECT messages.id, messages.text, users.username FROM messages JOIN users ON messages.user_id = users.id', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/messages', (req, res) => {
  const { text, userId } = req.body;
  db.run('INSERT INTO messages (text, user_id) VALUES (?, ?)', [text, userId], function(err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

app.get('/users', (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ changes: this.changes });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

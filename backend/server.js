const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const QRCode = require('qrcode');
const moment = require('moment');
const fs = require('fs');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Database
const db = new sqlite3.Database('./tickets.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      date TEXT,
      time TEXT,
      start_number INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_events (
      user_id INTEGER,
      event_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(event_id) REFERENCES events(id),
      PRIMARY KEY(user_id, event_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      number INTEGER,
      name TEXT,
      surname TEXT,
      birthdate TEXT,
      email TEXT,
      qr_code TEXT,
      status TEXT DEFAULT 'sold',
      FOREIGN KEY(event_id) REFERENCES events(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS age_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      min_age INTEGER,
      max_age INTEGER,
      color TEXT
    )`);

    // Insert default age rules
    db.run(`INSERT OR IGNORE INTO age_rules (min_age, max_age, color) VALUES (0, 17, 'red')`);
    db.run(`INSERT OR IGNORE INTO age_rules (min_age, max_age, color) VALUES (18, 25, 'yellow')`);
    db.run(`INSERT OR IGNORE INTO age_rules (min_age, max_age, color) VALUES (26, 150, 'green')`);

    // Insert default admin user
    const hashedPassword = bcrypt.hashSync('admin', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'admin')`, [hashedPassword]);
  });
}

// Get color for age
function getAgeColor(age, callback) {
  db.get('SELECT color FROM age_rules WHERE ? BETWEEN min_age AND max_age', [age], (err, row) => {
    if (err) return callback('green'); // default
    callback(row ? row.color : 'green');
  });
}

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function authorizeRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

// Users
app.get('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.delete('/api/users/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
  });
});

// Events
app.get('/api/events', authenticateToken, (req, res) => {
  const query = req.user.role === 'admin' ? 'SELECT * FROM events' : `
    SELECT e.* FROM events e
    JOIN user_events ue ON e.id = ue.event_id
    WHERE ue.user_id = ?
  `;
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/events', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { name, description, date, time, start_number, assigned_users } = req.body;
  db.run('INSERT INTO events (name, description, date, time, start_number) VALUES (?, ?, ?, ?, ?)', 
    [name, description, date, time, start_number], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const eventId = this.lastID;
    // Assign users
    if (assigned_users) {
      assigned_users.forEach(userId => {
        db.run('INSERT INTO user_events (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
      });
    }
    res.json({ id: eventId });
  });
});

// Tickets
app.get('/api/tickets/:eventId', authenticateToken, authorizeRole(['admin', 'seller']), (req, res) => {
  const { eventId } = req.params;
  db.all('SELECT * FROM tickets WHERE event_id = ?', [eventId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tickets', authenticateToken, authorizeRole(['admin', 'seller']), async (req, res) => {
  const { event_id, name, surname, birthdate, email } = req.body;
  
  // Get next number
  db.get('SELECT MAX(number) as maxNum FROM tickets WHERE event_id = ?', [event_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const nextNum = (row.maxNum || 0) + 1;
    
    // Encrypt ticket data
    const ticketData = { id: null, event_id, number: nextNum, name, surname, birthdate, email };
    const cipher = crypto.createCipher('aes-256-cbc', 'ticket-secret');
    let encrypted = cipher.update(JSON.stringify(ticketData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Generate QR
    QRCode.toDataURL(encrypted, (err, qrCode) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.run('INSERT INTO tickets (event_id, number, name, surname, birthdate, email, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [event_id, nextNum, name, surname, birthdate, email, qrCode], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        ticketData.id = this.lastID;
        
        // Send email if configured
        if (email && process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          QRCode.toBuffer(encrypted, async (err, buffer) => {
            if (!err) {
              try {
                await resend.emails.send({
                  from: 'noreply.r3gticketsys.tech',
                  to: email,
                  subject: 'Your Ticket',
                  text: `Here is your ticket. Ticket Number: ${nextNum}`,
                  attachments: [
                    {
                      filename: 'ticket-qr.png',
                      content: buffer,
                    },
                  ],
                });
              } catch (emailErr) {
                console.error('Email send error:', emailErr);
              }
            }
          });
        }
        
        res.json({ ticket: ticketData, qr_code: qrCode });
      });
    });
  });
});

// Edit ticket
app.put('/api/tickets/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { name, surname, birthdate, email, status } = req.body;
  const ticketId = req.params.id;

  // First get the current ticket
  db.get('SELECT * FROM tickets WHERE id = ?', [ticketId], (err, ticket) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Update the ticket
    db.run('UPDATE tickets SET name = ?, surname = ?, birthdate = ?, email = ?, status = ? WHERE id = ?', 
      [name || ticket.name, surname || ticket.surname, birthdate || ticket.birthdate, email || ticket.email, status || ticket.status, ticketId], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Regenerate QR code with updated data
      const updatedTicketData = { 
        id: ticketId, 
        event_id: ticket.event_id, 
        number: ticket.number, 
        name: name || ticket.name, 
        surname: surname || ticket.surname, 
        birthdate: birthdate || ticket.birthdate, 
        email: email || ticket.email 
      };
      const cipher = crypto.createCipher('aes-256-cbc', 'ticket-secret');
      let encrypted = cipher.update(JSON.stringify(updatedTicketData), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      QRCode.toDataURL(encrypted, (err, qrCode) => {
        if (err) return res.status(500).json({ error: err.message });

        db.run('UPDATE tickets SET qr_code = ? WHERE id = ?', [qrCode, ticketId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Ticket updated', qr_code: qrCode });
        });
      });
    });
  });
});

// Scan
app.post('/api/scan', authenticateToken, authorizeRole(['admin', 'scanner']), (req, res) => {
  const { qr_code } = req.body;
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', 'ticket-secret');
    let decrypted = decipher.update(qr_code, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const ticketData = JSON.parse(decrypted);
    
    // Calculate age
    const birthdate = moment(ticketData.birthdate, 'DDMMYY');
    const age = moment().diff(birthdate, 'years');
    
    getAgeColor(age, (color) => {
      // Update status
      db.run('UPDATE tickets SET status = ? WHERE id = ?', ['scanned', ticketData.id]);
      
      res.json({ ...ticketData, age, color, status: 'scanned' });
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid QR code' });
  }
});

// Age rules
app.get('/api/age-rules', authenticateToken, authorizeRole(['admin']), (req, res) => {
  db.all('SELECT * FROM age_rules ORDER BY min_age', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/age-rules', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { min_age, max_age, color } = req.body;
  db.run('INSERT INTO age_rules (min_age, max_age, color) VALUES (?, ?, ?)', [min_age, max_age, color], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/age-rules/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { min_age, max_age, color } = req.body;
  db.run('UPDATE age_rules SET min_age = ?, max_age = ?, color = ? WHERE id = ?', [min_age, max_age, color, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated' });
  });
});

app.delete('/api/age-rules/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  db.run('DELETE FROM age_rules WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client } = require('pg');
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
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect((err) => {
  if (err) throw err;
  console.log('Connected to PostgreSQL database.');
  initDatabase();
});

// Initialize database tables
function initDatabase() {
  client.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`, (err) => { if (err) throw err; });

  client.query(`CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    date TEXT,
    time TEXT,
    start_number INTEGER
  )`, (err) => { if (err) throw err; });

  client.query(`CREATE TABLE IF NOT EXISTS user_events (
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    PRIMARY KEY(user_id, event_id)
  )`, (err) => { if (err) throw err; });

  client.query(`CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    number INTEGER,
    name TEXT,
    surname TEXT,
    birthdate TEXT,
    email TEXT,
    qr_code TEXT,
    status TEXT DEFAULT 'sold'
  )`, (err) => { if (err) throw err; });

  client.query(`CREATE TABLE IF NOT EXISTS age_rules (
    id SERIAL PRIMARY KEY,
    min_age INTEGER,
    max_age INTEGER,
    color TEXT
  )`, (err) => { if (err) throw err; });

  client.query(`INSERT INTO age_rules (min_age, max_age, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [0, 17, 'red'], (err) => { if (err) throw err; });
  client.query(`INSERT INTO age_rules (min_age, max_age, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [18, 25, 'yellow'], (err) => { if (err) throw err; });
  client.query(`INSERT INTO age_rules (min_age, max_age, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [26, 150, 'green'], (err) => { if (err) throw err; });

  // Insert default admin user
  const hashedPassword = bcrypt.hashSync('admin', 10);
  client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING`, ['admin', hashedPassword, 'admin'], (err) => { if (err) throw err; });
}

// Get color for age
function getAgeColor(age, callback) {
  client.query('SELECT color FROM age_rules WHERE $1 BETWEEN min_age AND max_age', [age], (err, res) => {
    if (err) return callback('green');
    callback(res.rows[0] ? res.rows[0].color : 'green');
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
  client.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

// Users
app.get('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  client.query('SELECT id, username, role FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

app.post('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  client.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id', [username, hashedPassword, role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.rows[0].id });
  });
});

app.delete('/api/users/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  client.query('DELETE FROM users WHERE id = $1', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
  });
});

// Events
app.get('/api/events', authenticateToken, (req, res) => {
  const query = req.user.role === 'admin' ? 'SELECT * FROM events' : `
    SELECT e.* FROM events e
    JOIN user_events ue ON e.id = ue.event_id
    WHERE ue.user_id = $1
  `;
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  client.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

app.post('/api/events', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { name, description, date, time, start_number, assigned_users } = req.body;
  client.query('INSERT INTO events (name, description, date, time, start_number) VALUES ($1, $2, $3, $4, $5) RETURNING id', 
    [name, description, date, time, start_number], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const eventId = result.rows[0].id;
    // Assign users
    if (assigned_users && assigned_users.length > 0) {
      const values = assigned_users.map(userId => `(${userId}, ${eventId})`).join(', ');
      client.query(`INSERT INTO user_events (user_id, event_id) VALUES ${values}`, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: eventId });
      });
    } else {
      res.json({ id: eventId });
    }
  });
});

// Tickets
app.get('/api/tickets/:eventId', authenticateToken, authorizeRole(['admin', 'seller']), (req, res) => {
  const { eventId } = req.params;
  client.query('SELECT * FROM tickets WHERE event_id = $1', [eventId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

app.post('/api/tickets', authenticateToken, authorizeRole(['admin', 'seller']), async (req, res) => {
  const { event_id, name, surname, birthdate, email } = req.body;
  
  // Get next number
  client.query('SELECT MAX(number) as maxnum FROM tickets WHERE event_id = $1', [event_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const nextNum = (result.rows[0].maxnum || 0) + 1;
    
    // Encrypt ticket data
    const ticketData = { id: null, event_id, number: nextNum, name, surname, birthdate, email };
    const cipher = crypto.createCipher('aes-256-cbc', 'ticket-secret');
    let encrypted = cipher.update(JSON.stringify(ticketData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Generate QR
    QRCode.toDataURL(encrypted, (err, qrCode) => {
      if (err) return res.status(500).json({ error: err.message });
      
      client.query('INSERT INTO tickets (event_id, number, name, surname, birthdate, email, qr_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id', 
        [event_id, nextNum, name, surname, birthdate, email, qrCode], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        ticketData.id = result.rows[0].id;
        
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
        
        res.json(ticketData);
      });
    });
  });
});// Edit ticket
app.put('/api/tickets/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { name, surname, birthdate, email, status } = req.body;
  const ticketId = req.params.id;

  // First get the current ticket
  client.query('SELECT * FROM tickets WHERE id = $1', [ticketId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const ticket = result.rows[0];
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Update the ticket
    client.query('UPDATE tickets SET name = $1, surname = $2, birthdate = $3, email = $4, status = $5 WHERE id = $6', 
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

      QRCode.toDataURL(encrypted, (err, newQrCode) => {
        if (err) return res.status(500).json({ error: err.message });
        client.query('UPDATE tickets SET qr_code = $1 WHERE id = $2', [newQrCode, ticketId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Ticket updated' });
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
      client.query('UPDATE tickets SET status = $1 WHERE id = $2', ['scanned', ticketData.id]);
      
      res.json({ ...ticketData, age, color, status: 'scanned' });
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid QR code' });
  }
});

// Age rules
app.get('/api/age-rules', authenticateToken, authorizeRole(['admin']), (req, res) => {
  client.query('SELECT * FROM age_rules ORDER BY min_age', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

app.post('/api/age-rules', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { min_age, max_age, color } = req.body;
  client.query('INSERT INTO age_rules (min_age, max_age, color) VALUES ($1, $2, $3) RETURNING id', [min_age, max_age, color], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.rows[0].id });
  });
});

app.put('/api/age-rules/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const { min_age, max_age, color } = req.body;
  client.query('UPDATE age_rules SET min_age = $1, max_age = $2, color = $3 WHERE id = $4', [min_age, max_age, color, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated' });
  });
});

app.delete('/api/age-rules/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  client.query('DELETE FROM age_rules WHERE id = $1', [req.params.id], (err) => {
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
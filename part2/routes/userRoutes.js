const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Store user in session
    req.session.user = rows[0];

    res.json({
      message: 'Login successful',
      user: rows[0],
      redirectUrl: rows[0].role === 'owner' ? '/owner-dashboard.html' : '/walker-dashboard.html'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clears the session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/dogs/mine - get all dogs for the logged-in owner
router.get('/dogs/mine', async (req, res) => {
  // Verify session exists
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Verify user is an owner
  if (req.session.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access forbidden' });
  }

  const ownerId = req.session.user.user_id;

  try {
    const [rows] = await db.query(`
      SELECT dog_id, name, size 
      FROM Dogs 
      WHERE owner_id = ?
    `, [ownerId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

router.get('/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        Dogs.dog_id, 
        Dogs.name AS dog_name, 
        Dogs.size, 
        Dogs.owner_id, 
        Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});
module.exports = router;
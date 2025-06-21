// routes/dogRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all dogs with owner info
router.get('/dogs', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT 
        Dogs.dog_id, 
        Dogs.name AS dog_name, 
        Dogs.size, 
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

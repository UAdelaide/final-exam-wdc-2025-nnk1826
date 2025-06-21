import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/api/dogs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

export default router;

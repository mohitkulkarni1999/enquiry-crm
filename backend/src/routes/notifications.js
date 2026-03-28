require('dotenv').config();
const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { authenticate } = require('../middleware/auth');

router.get('/follow-up/:userId', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE DATE(follow_up_date) = ? ORDER BY follow_up_date ASC', [today]);
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/upcoming/:userId', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE follow_up_date BETWEEN ? AND ? ORDER BY follow_up_date ASC',
      [now.toISOString(), weekLater.toISOString()]);
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;

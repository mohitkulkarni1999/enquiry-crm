const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');

// Get form configuration
router.get('/form-config', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT setting_value FROM app_settings WHERE setting_key = 'form_config'");
    if (rows.length === 0) return res.json([]);
    res.json(rows[0].setting_value);
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({ error: 'Failed to fetch form configuration' });
  }
});

// Update form configuration (Super Admin only)
router.post('/form-config', verifyToken, async (req, res) => {
  try {
    const config = req.body;
    if (!Array.isArray(config)) {
      return res.status(400).json({ error: 'Config must be an array' });
    }
    
    await pool.execute(
      "INSERT INTO app_settings (setting_key, setting_value) VALUES ('form_config', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [JSON.stringify(config), JSON.stringify(config)]
    );
    
    res.json({ success: true, message: 'Form configuration updated' });
  } catch (error) {
    console.error('Error saving form config:', error);
    res.status(500).json({ error: 'Failed to save form configuration' });
  }
});

module.exports = router;

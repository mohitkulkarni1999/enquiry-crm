require('dotenv').config();
const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { authenticate, requireRole } = require('../middleware/auth');

function fmt(row) {
  return { id: row.id, username: row.username, name: row.full_name, fullName: row.full_name,
    email: row.email, phone: row.phone, role: row.role, organization: row.organization,
    isActive: !!row.is_active, createdAt: row.created_at, updatedAt: row.updated_at };
}

function paginate(rows, page, size) {
  return { content: rows.slice(page*size, page*size+size), totalElements: rows.length, totalPages: Math.ceil(rows.length/size), number: page, size };
}

router.get('/', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const { page=0, size=100 } = req.query;
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY full_name ASC');
    return res.json(paginate(rows.map(fmt), parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/active', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE is_active = 1 ORDER BY full_name ASC');
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/by-role/:role', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE role = ? ORDER BY full_name ASC', [req.params.role]);
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/active/by-role/:role', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE role = ? AND is_active = 1 ORDER BY full_name ASC', [req.params.role]);
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/search', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const { searchTerm='', page=0, size=10 } = req.query;
    const term = `%${searchTerm}%`;
    const [rows] = await pool.execute('SELECT * FROM users WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ? ORDER BY full_name ASC', [term,term,term]);
    return res.json(paginate(rows.map(fmt), parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/total', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM users');
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/active', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/by-role/:role', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', [req.params.role]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/active/by-role/:role', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1', [req.params.role]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, requireRole('SUPER_ADMIN','CRM_ADMIN'), async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { active } = req.query;
    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [active === 'true' ? 1 : 0, req.params.id]);
    const [[row]] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
    return res.json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;

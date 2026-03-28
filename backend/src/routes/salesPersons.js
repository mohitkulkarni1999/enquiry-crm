require('dotenv').config();
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../database');
const { authenticate, requireRole } = require('../middleware/auth');

function fmt(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, name: row.name, email: row.email, phone: row.phone,
    specialization: row.specialization, experience: row.experience,
    isAvailable: !!row.is_available, available: !!row.is_available,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function paginate(rows, page, size) {
  return { content: rows.slice(page*size, page*size+size), totalElements: rows.length, totalPages: Math.ceil(rows.length/size), number: page, size };
}

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=0, size=100 } = req.query;
    const [rows] = await pool.execute('SELECT * FROM sales_persons ORDER BY name ASC');
    return res.json(paginate(rows.map(fmt), parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/available', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM sales_persons WHERE is_available = 1 ORDER BY name ASC');
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/least-enquiries', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT sp.*, COUNT(e.id) as eq_count FROM sales_persons sp
      LEFT JOIN enquiries e ON e.assigned_to = sp.id
      WHERE sp.is_available = 1 GROUP BY sp.id ORDER BY eq_count ASC LIMIT 1
    `);
    return res.json(rows[0] ? fmt(rows[0]) : null);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/search', authenticate, async (req, res) => {
  try {
    const { searchTerm='', page=0, size=10 } = req.query;
    const term = `%${searchTerm}%`;
    const [rows] = await pool.execute('SELECT * FROM sales_persons WHERE name LIKE ? OR email LIKE ? ORDER BY name ASC', [term, term]);
    return res.json(paginate(rows.map(fmt), parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/total', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM sales_persons');
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/available', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM sales_persons WHERE is_available = 1');
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/:id/performance', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [[t]] = await pool.execute('SELECT COUNT(*) as count FROM enquiries WHERE assigned_to = ?', [id]);
    const [[b]] = await pool.execute("SELECT COUNT(*) as count FROM enquiries WHERE assigned_to = ? AND status IN ('booked','BOOKED','CLOSED_WON')", [id]);
    const [[h]] = await pool.execute("SELECT COUNT(*) as count FROM enquiries WHERE assigned_to = ? AND interest_level = 'hot'", [id]);
    return res.json({ totalEnquiries: t.count, bookedEnquiries: b.count, hotLeads: h.count, conversionRate: t.count > 0 ? ((b.count/t.count)*100).toFixed(1) : 0 });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT * FROM sales_persons WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const { name, email, phone, specialization, experience } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    await pool.execute('INSERT INTO sales_persons (id, name, email, phone, specialization, experience) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email||null, phone||null, specialization||null, experience||null]);
    const [[row]] = await pool.execute('SELECT * FROM sales_persons WHERE id = ?', [id]);
    return res.status(201).json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, isAvailable } = req.body;
    const parts = [], vals = [];
    if (name !== undefined) { parts.push('name=?'); vals.push(name); }
    if (email !== undefined) { parts.push('email=?'); vals.push(email||null); }
    if (phone !== undefined) { parts.push('phone=?'); vals.push(phone||null); }
    if (specialization !== undefined) { parts.push('specialization=?'); vals.push(specialization||null); }
    if (experience !== undefined) { parts.push('experience=?'); vals.push(experience||null); }
    if (isAvailable !== undefined) { parts.push('is_available=?'); vals.push(isAvailable ? 1 : 0); }
    if (parts.length) { vals.push(req.params.id); await pool.execute(`UPDATE sales_persons SET ${parts.join(',')} WHERE id=?`, vals); }
    const [[row]] = await pool.execute('SELECT * FROM sales_persons WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const [r] = await pool.execute('DELETE FROM sales_persons WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(204).send();
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.put('/:id/availability', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const { available } = req.query;
    await pool.execute('UPDATE sales_persons SET is_available = ? WHERE id = ?', [available === 'true' ? 1 : 0, req.params.id]);
    const [[row]] = await pool.execute('SELECT * FROM sales_persons WHERE id = ?', [req.params.id]);
    return res.json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;

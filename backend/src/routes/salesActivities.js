require('dotenv').config();
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../database');
const { authenticate } = require('../middleware/auth');

function fmt(row) {
  return { id: row.id, enquiryId: row.enquiry_id, salesPersonId: row.sales_person_id,
    activityType: row.activity_type, activityDate: row.activity_date, notes: row.notes,
    outcome: row.outcome, duration: row.duration, createdAt: row.created_at };
}

function paginate(rows, page, size) {
  return { content: rows.slice(page*size, page*size+size), totalElements: rows.length, totalPages: Math.ceil(rows.length/size), number: page, size };
}

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=0, size=100 } = req.query;
    const [rows] = await pool.execute('SELECT * FROM sales_activities ORDER BY activity_date DESC');
    return res.json(paginate(rows.map(fmt), parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/recent', authenticate, async (req, res) => {
  try {
    const { limit=10 } = req.query;
    const [rows] = await pool.execute('SELECT * FROM sales_activities ORDER BY activity_date DESC LIMIT ?', [parseInt(limit)]);
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/by-enquiry/:enquiryId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM sales_activities WHERE enquiry_id = ? ORDER BY activity_date DESC', [req.params.enquiryId]);
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/by-sales-person/:salesPersonId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM sales_activities WHERE sales_person_id = ? ORDER BY activity_date DESC', [req.params.salesPersonId]);
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/by-type/:activityType', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM sales_activities WHERE activity_type = ? ORDER BY activity_date DESC', [req.params.activityType]);
    return res.json(rows.map(fmt));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/by-date-range', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, page=0, size=10 } = req.query;
    const [rows] = await pool.execute('SELECT * FROM sales_activities WHERE activity_date BETWEEN ? AND ? ORDER BY activity_date DESC', [startDate, endDate]);
    return res.json(paginate(rows.map(fmt), parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/search', authenticate, async (req, res) => {
  try {
    const { searchTerm='', page=0, size=10 } = req.query;
    const term = `%${searchTerm}%`;
    const [rows] = await pool.execute('SELECT * FROM sales_activities WHERE notes LIKE ? OR outcome LIKE ? ORDER BY activity_date DESC', [term, term]);
    return res.json(paginate(rows.map(fmt), parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/total', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM sales_activities');
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/by-type/:activityType', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM sales_activities WHERE activity_type = ?', [req.params.activityType]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/count/by-sales-person/:salesPersonId', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM sales_activities WHERE sales_person_id = ?', [req.params.salesPersonId]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT * FROM sales_activities WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { enquiryId, salesPersonId, activityType, activityDate, notes, outcome, duration } = req.body;
    if (!activityType) return res.status(400).json({ error: 'activityType required' });
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO sales_activities (id, enquiry_id, sales_person_id, activity_type, activity_date, notes, outcome, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, enquiryId||null, salesPersonId||null, activityType, activityDate||new Date(), notes||null, outcome||null, duration||null]
    );
    const [[row]] = await pool.execute('SELECT * FROM sales_activities WHERE id = ?', [id]);
    return res.status(201).json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/log', authenticate, async (req, res) => {
  try {
    const { enquiryId, salesPersonId, activityType, notes, outcome } = req.body;
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO sales_activities (id, enquiry_id, sales_person_id, activity_type, notes, outcome) VALUES (?, ?, ?, ?, ?, ?)',
      [id, enquiryId||null, salesPersonId||null, activityType||'NOTE', notes||null, outcome||null]
    );
    const [[row]] = await pool.execute('SELECT * FROM sales_activities WHERE id = ?', [id]);
    return res.status(201).json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { activityType, activityDate, notes, outcome, duration } = req.body;
    const parts = [], vals = [];
    if (activityType) { parts.push('activity_type=?'); vals.push(activityType); }
    if (activityDate) { parts.push('activity_date=?'); vals.push(activityDate); }
    if (notes !== undefined) { parts.push('notes=?'); vals.push(notes||null); }
    if (outcome !== undefined) { parts.push('outcome=?'); vals.push(outcome||null); }
    if (duration !== undefined) { parts.push('duration=?'); vals.push(duration||null); }
    if (parts.length) { vals.push(req.params.id); await pool.execute(`UPDATE sales_activities SET ${parts.join(',')} WHERE id=?`, vals); }
    const [[row]] = await pool.execute('SELECT * FROM sales_activities WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    return res.json(fmt(row));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [r] = await pool.execute('DELETE FROM sales_activities WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(204).send();
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;

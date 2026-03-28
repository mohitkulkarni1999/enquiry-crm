require('dotenv').config();
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../database');
const { authenticate, requireRole } = require('../middleware/auth');

async function getSalesPerson(id) {
  if (!id) return null;
  const [rows] = await pool.execute('SELECT id, name, email, phone FROM sales_persons WHERE id = ?', [id]);
  return rows[0] || null;
}

function formatEnquiry(row, assignedTo) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerMobile: row.customer_mobile,
    customerPhone: row.customer_mobile,
    propertyType: row.property_type,
    budgetRange: row.budget_range,
    source: row.source,
    status: row.status,
    interestLevel: row.interest_level,
    assignedTo: assignedTo || null,
    remarks: row.remarks,
    followUpDate: row.follow_up_date,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function enrichEnquiries(rows) {
  return Promise.all(rows.map(async row => {
    const sp = row.assigned_to ? await getSalesPerson(row.assigned_to) : null;
    return formatEnquiry(row, sp);
  }));
}

function paginate(rows, page, size) {
  const total = rows.length;
  const start = page * size;
  return { content: rows.slice(start, start + size), totalElements: total, totalPages: Math.ceil(total / size), number: page, size };
}

// GET /enquiries
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 0, size = 100 } = req.query;
    let rows;
    if (req.user.role === 'SALES') {
      const [sp] = await pool.execute('SELECT id FROM sales_persons WHERE user_id = ?', [req.user.id]);
      if (!sp.length) return res.json(paginate([], 0, 100));
      const [r] = await pool.execute('SELECT * FROM enquiries WHERE assigned_to = ? ORDER BY created_at DESC', [sp[0].id]);
      rows = r;
    } else {
      const [r] = await pool.execute('SELECT * FROM enquiries ORDER BY created_at DESC');
      rows = r;
    }
    const enriched = await enrichEnquiries(rows);
    return res.json(paginate(enriched, parseInt(page), parseInt(size)));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /enquiries/unassigned
router.get('/unassigned', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE assigned_to IS NULL ORDER BY created_at DESC');
    return res.json(await enrichEnquiries(rows));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/active
router.get('/active', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM enquiries WHERE status IN ('new','in_progress') ORDER BY created_at DESC");
    return res.json(await enrichEnquiries(rows));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/hot-leads
router.get('/hot-leads', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM enquiries WHERE interest_level = 'hot' ORDER BY created_at DESC");
    return res.json(await enrichEnquiries(rows));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/search
router.get('/search', authenticate, async (req, res) => {
  try {
    const { searchTerm = '', page = 0, size = 10 } = req.query;
    const term = `%${searchTerm}%`;
    const [rows] = await pool.execute(
      'SELECT * FROM enquiries WHERE customer_name LIKE ? OR customer_email LIKE ? OR customer_mobile LIKE ? ORDER BY created_at DESC',
      [term, term, term]
    );
    const enriched = await enrichEnquiries(rows);
    return res.json(paginate(enriched, parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/by-status/:status
router.get('/by-status/:status', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC', [req.params.status]);
    return res.json(await enrichEnquiries(rows));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/by-interest-level/:level
router.get('/by-interest-level/:interestLevel', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE interest_level = ? ORDER BY created_at DESC', [req.params.interestLevel]);
    return res.json(await enrichEnquiries(rows));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/by-sales-person/:id
router.get('/by-sales-person/:salesPersonId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE assigned_to = ? ORDER BY created_at DESC', [req.params.salesPersonId]);
    return res.json(await enrichEnquiries(rows));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/filtered
router.get('/filtered', authenticate, async (req, res) => {
  try {
    const { status, interestLevel, assignedTo, page = 0, size = 10 } = req.query;
    let q = 'SELECT * FROM enquiries WHERE 1=1';
    const vals = [];
    if (status) { q += ' AND status = ?'; vals.push(status); }
    if (interestLevel) { q += ' AND interest_level = ?'; vals.push(interestLevel); }
    if (assignedTo) { q += ' AND assigned_to = ?'; vals.push(assignedTo); }
    q += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(q, vals);
    const enriched = await enrichEnquiries(rows);
    return res.json(paginate(enriched, parseInt(page), parseInt(size)));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/count/total
router.get('/count/total', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM enquiries');
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/count/by-status/:status
router.get('/count/by-status/:status', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM enquiries WHERE status = ?', [req.params.status]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/count/by-interest-level/:level
router.get('/count/by-interest-level/:interestLevel', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM enquiries WHERE interest_level = ?', [req.params.interestLevel]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/count/by-sales-person/:id
router.get('/count/by-sales-person/:salesPersonId', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM enquiries WHERE assigned_to = ?', [req.params.salesPersonId]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const sp = row.assigned_to ? await getSalesPerson(row.assigned_to) : null;
    return res.json(formatEnquiry(row, sp));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /enquiries (public)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, customerMobile, propertyType, budgetRange, source, remarks } = req.body;
    if (!customerName || !customerMobile)
      return res.status(400).json({ error: 'Customer name and mobile are required' });

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO enquiries (id, customer_name, customer_email, customer_mobile, property_type, budget_range, source, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, customerName, customerEmail || null, customerMobile, propertyType || null, budgetRange || null, source || 'WEBSITE', remarks || null]
    );
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [id]);
    return res.status(201).json(formatEnquiry(row, null));
  } catch (err) {
    console.error('POST /enquiries error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /enquiries/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerEmail, customerMobile, propertyType, budgetRange, source, status, interestLevel, remarks, followUpDate, priority } = req.body;
    await pool.execute(`
      UPDATE enquiries SET
        customer_name = COALESCE(?, customer_name),
        customer_email = COALESCE(?, customer_email),
        customer_mobile = COALESCE(?, customer_mobile),
        property_type = COALESCE(?, property_type),
        budget_range = COALESCE(?, budget_range),
        source = COALESCE(?, source),
        status = COALESCE(?, status),
        interest_level = COALESCE(?, interest_level),
        remarks = COALESCE(?, remarks),
        follow_up_date = COALESCE(?, follow_up_date),
        priority = COALESCE(?, priority)
      WHERE id = ?
    `, [customerName || null, customerEmail || null, customerMobile || null, propertyType || null, budgetRange || null, source || null, status || null, interestLevel || null, remarks || null, followUpDate || null, priority || null, id]);
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const sp = row.assigned_to ? await getSalesPerson(row.assigned_to) : null;
    return res.json(formatEnquiry(row, sp));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// DELETE /enquiries/:id
router.delete('/:id', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const [r] = await pool.execute('DELETE FROM enquiries WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(204).send();
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /enquiries/:id/assign/:salesPersonId
router.post('/:id/assign/:salesPersonId', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const { id, salesPersonId } = req.params;
    const [[sp]] = await pool.execute('SELECT * FROM sales_persons WHERE id = ?', [salesPersonId]);
    if (!sp) return res.status(404).json({ error: 'Sales person not found' });
    await pool.execute("UPDATE enquiries SET assigned_to = ?, status = 'in_progress' WHERE id = ?", [salesPersonId, id]);
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [id]);
    return res.json(formatEnquiry(row, { id: sp.id, name: sp.name, email: sp.email, phone: sp.phone }));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /enquiries/:id/auto-assign
router.post('/:id/auto-assign', authenticate, requireRole('CRM_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const [sps] = await pool.execute(`
      SELECT sp.*, COUNT(e.id) as eq_count
      FROM sales_persons sp
      LEFT JOIN enquiries e ON e.assigned_to = sp.id AND e.status NOT IN ('booked','not_interested','unqualified')
      WHERE sp.is_available = 1
      GROUP BY sp.id
      ORDER BY eq_count ASC
      LIMIT 1
    `);
    if (!sps.length) return res.status(404).json({ error: 'No available sales persons' });
    const sp = sps[0];
    await pool.execute("UPDATE enquiries SET assigned_to = ?, status = 'in_progress' WHERE id = ?", [sp.id, id]);
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [id]);
    return res.json(formatEnquiry(row, { id: sp.id, name: sp.name, email: sp.email, phone: sp.phone }));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// PUT /enquiries/:id/status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    await pool.execute('UPDATE enquiries SET status = ? WHERE id = ?', [status, req.params.id]);
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    const sp = row.assigned_to ? await getSalesPerson(row.assigned_to) : null;
    return res.json(formatEnquiry(row, sp));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// PUT /enquiries/:id/interest-level
router.put('/:id/interest-level', authenticate, async (req, res) => {
  try {
    const { interestLevel } = req.query;
    await pool.execute('UPDATE enquiries SET interest_level = ? WHERE id = ?', [interestLevel, req.params.id]);
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    const sp = row.assigned_to ? await getSalesPerson(row.assigned_to) : null;
    return res.json(formatEnquiry(row, sp));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /enquiries/:id/remarks  (accepts text/plain or JSON)
router.post('/:id/remarks', async (req, res) => {
  try {
    const remarks = typeof req.body === 'string' ? req.body : (req.body?.remarks || String(req.body || ''));
    await pool.execute('UPDATE enquiries SET remarks = ? WHERE id = ?', [remarks, req.params.id]);
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    const sp = row.assigned_to ? await getSalesPerson(row.assigned_to) : null;
    return res.json(formatEnquiry(row, sp));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /enquiries/:id/schedule-follow-up
router.post('/:id/schedule-follow-up', async (req, res) => {
  try {
    const { followUpDate } = req.query;
    await pool.execute('UPDATE enquiries SET follow_up_date = ? WHERE id = ?', [followUpDate, req.params.id]);
    const [[row]] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    const sp = row.assigned_to ? await getSalesPerson(row.assigned_to) : null;
    return res.json(formatEnquiry(row, sp));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/:id/comments
router.get('/:id/comments', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM comments WHERE enquiry_id = ? ORDER BY created_at DESC', [req.params.id]);
    return res.json(rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /enquiries/:id/comments
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { userId, commentText } = req.body;
    const id = uuidv4();
    await pool.execute('INSERT INTO comments (id, enquiry_id, user_id, comment_text) VALUES (?, ?, ?, ?)',
      [id, req.params.id, userId || req.user.id, commentText]);
    const [[row]] = await pool.execute('SELECT * FROM comments WHERE id = ?', [id]);
    return res.status(201).json(row);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// GET /enquiries/:id/comments/count
router.get('/:id/comments/count', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM comments WHERE enquiry_id = ?', [req.params.id]);
    return res.json(row.count);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// DELETE /enquiries/comments/:commentId
router.delete('/comments/:commentId', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM comments WHERE id = ?', [req.params.commentId]);
    return res.status(204).send();
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../database');
const { generateToken, authenticate, requireRole } = require('../middleware/auth');

function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    name: row.full_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    organization: row.organization,
    isActive: !!row.is_active,
    createdAt: row.created_at
  };
}

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password required' });

    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out' }));

// POST /auth/register/super-admin (public)
router.post('/register/super-admin', async (req, res) => {
  try {
    const { username, password, fullName, email, organization } = req.body;
    if (!username || !password || !fullName)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Username already exists' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    await pool.execute(
      'INSERT INTO users (id, username, password, full_name, email, role, organization) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, hash, fullName, email || null, 'SUPER_ADMIN', organization || null]
    );
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return res.status(201).json({ success: true, user: formatUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /auth/register (generic)
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName || !role)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Username already exists' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    await pool.execute(
      'INSERT INTO users (id, username, password, full_name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, hash, fullName, email || null, phone || null, role]
    );

    if (role === 'SALES') {
      await pool.execute(
        'INSERT INTO sales_persons (id, user_id, name, email, phone) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), id, fullName, email || null, phone || null]
      );
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return res.status(201).json({ success: true, user: formatUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /auth/register/crm-admin
router.post('/register/crm-admin', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { username, password, fullName, email, phone } = req.body;
    if (!username || !password || !fullName)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Username already exists' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    await pool.execute(
      'INSERT INTO users (id, username, password, full_name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, hash, fullName, email || null, phone || null, 'CRM_ADMIN']
    );
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return res.status(201).json({ success: true, user: formatUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /auth/register/sales
router.post('/register/sales', authenticate, requireRole('SUPER_ADMIN', 'CRM_ADMIN'), async (req, res) => {
  try {
    const { username, password, fullName, email, phone } = req.body;
    if (!username || !password || !fullName)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Username already exists' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    await pool.execute(
      'INSERT INTO users (id, username, password, full_name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, hash, fullName, email || null, phone || null, 'SALES']
    );
    const spId = uuidv4();
    await pool.execute(
      'INSERT INTO sales_persons (id, user_id, name, email, phone) VALUES (?, ?, ?, ?, ?)',
      [spId, id, fullName, email || null, phone || null]
    );
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return res.status(201).json({ success: true, user: formatUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const username = req.query.username || req.user.username;
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.json(formatUser(rows[0]));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /auth/update-crm-admin/:id
router.put('/update-crm-admin/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, email, phone, password } = req.body;
    let q = 'UPDATE users SET full_name=?, email=?, phone=?, username=?';
    const vals = [fullName, email || null, phone || null, username];
    if (password) { q += ', password=?'; vals.push(bcrypt.hashSync(password, 10)); }
    q += ' WHERE id=?'; vals.push(id);
    await pool.execute(q, vals);
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return res.json({ success: true, user: formatUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /auth/update-sales/:id
router.put('/update-sales/:id', authenticate, requireRole('SUPER_ADMIN', 'CRM_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, email, phone, password } = req.body;
    let q = 'UPDATE users SET full_name=?, email=?, phone=?, username=?';
    const vals = [fullName, email || null, phone || null, username];
    if (password) { q += ', password=?'; vals.push(bcrypt.hashSync(password, 10)); }
    q += ' WHERE id=?'; vals.push(id);
    await pool.execute(q, vals);
    await pool.execute(
      'UPDATE sales_persons SET name=?, email=?, phone=? WHERE user_id=?',
      [fullName, email || null, phone || null, id]
    );
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return res.json({ success: true, user: formatUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /auth/update-super-admin/:id
router.put('/update-super-admin/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, email, phone, password, organization } = req.body;
    let q = 'UPDATE users SET full_name=?, email=?, phone=?, username=?, organization=?';
    const vals = [fullName, email || null, phone || null, username, organization || null];
    if (password) { q += ', password=?'; vals.push(bcrypt.hashSync(password, 10)); }
    q += ' WHERE id=?'; vals.push(id);
    await pool.execute(q, vals);
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return res.json({ success: true, user: formatUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /auth/delete-user/:id
router.delete('/delete-user/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /auth/create-test-users
router.post('/create-test-users', async (req, res) => {
  try {
    const testUsers = [
      { username: 'crmadmin', password: 'admin123', fullName: 'CRM Administrator', email: 'crm@crm.com', phone: null, role: 'CRM_ADMIN' },
      { username: 'sales1',   password: 'sales123', fullName: 'Rajesh Kumar',      email: 'rajesh@crm.com', phone: '+91 98765 43210', role: 'SALES' },
      { username: 'sales2',   password: 'sales123', fullName: 'Priya Sharma',      email: 'priya@crm.com',  phone: '+91 87654 32109', role: 'SALES' },
    ];

    for (const u of testUsers) {
      const [ex] = await pool.execute('SELECT id FROM users WHERE username = ?', [u.username]);
      if (!ex.length) {
        const id = uuidv4();
        const hash = bcrypt.hashSync(u.password, 10);
        await pool.execute(
          'INSERT INTO users (id, username, password, full_name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, u.username, hash, u.fullName, u.email || null, u.phone || null, u.role]
        );
        if (u.role === 'SALES') {
          await pool.execute(
            'INSERT INTO sales_persons (id, user_id, name, email, phone) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), id, u.fullName, u.email || null, u.phone || null]
          );
        }
      }
    }
    return res.json({ success: true, message: 'Test users created' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

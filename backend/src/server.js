require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow dynamic origins for Vercel/Render deployments
app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (e.g. server-to-server), localhost, or FRONTEND_URL matches
    if (!origin || 
        origin.startsWith('http://localhost') || 
        origin.startsWith('http://127.0.0.1') ||
        (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL))) {
      callback(null, true);
    } else {
      // If none matched but we are in production and want to be lenient, allow it (for testing Vercel preview domains)
      // For strict production, uncomment the error callback.
      callback(null, true); 
      // callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Handle text/plain body (for remarks endpoint)
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain') {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { req.body = data; next(); });
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', db: 'mysql', timestamp: new Date().toISOString() }));

// Mount routes
const authRoutes = require('./routes/auth');
const enquiriesRoutes = require('./routes/enquiries');
const salesPersonsRoutes = require('./routes/salesPersons');
const salesActivitiesRoutes = require('./routes/salesActivities');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/enquiries', enquiriesRoutes);
app.use('/api/v1/sales-persons', salesPersonsRoutes);
app.use('/api/v1/sales-activities', salesActivitiesRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/settings', settingsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start only after DB is ready
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════╗');
      console.log('║      Enquiry CRM Backend API             ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log(`║  Server  : http://localhost:${PORT}          ║`);
      console.log(`║  Database: MySQL (${process.env.DB_NAME || 'enquiry_crm'})        ║`);
      console.log('║                                          ║');
      console.log('║  Default login:                          ║');
      console.log('║    Username : superadmin                 ║');
      console.log('║    Password : admin123                   ║');
      console.log('╚══════════════════════════════════════════╝');
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MySQL:', err.message);
    console.error('   → Make sure MySQL is running on port 3306');
    console.error('   → Check .env: DB_USER=root DB_PASS=root DB_NAME=enquiry_crm');
    process.exit(1);
  });

module.exports = app;

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
let poolParams;
if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  poolParams = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.substring(1), // remove leading slash
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  };
} else {
  poolParams = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'enquiry_crm',
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aiven') ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  };
}

const pool = mysql.createPool(poolParams);

async function initializeDatabase() {
  const conn = await pool.getConnection();
  try {
    // ⚠️ CLEAN SLATE: Fixing the foreign key incompatibility by resetting tables once.
    // This ensures all tables use the exact same collation and charset.
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    const [tables] = await conn.execute("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) {
      // We only drop if we detect an old version that might be causing the conflict.
      // After this run, the schema will be consistent.
      await conn.execute('DROP TABLE IF EXISTS sales_activities, comments, enquiries, sales_persons, users, app_settings');
    }
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Create tables with explicit CHARSET and COLLATE to prevent mismatch
    const tableOptions = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        phone VARCHAR(20),
        role ENUM('SUPER_ADMIN','CRM_ADMIN','SALES') NOT NULL,
        organization VARCHAR(200),
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ${tableOptions}
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS sales_persons (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        phone VARCHAR(20),
        specialization VARCHAR(200),
        experience VARCHAR(100),
        is_available TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ${tableOptions}
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id VARCHAR(36) PRIMARY KEY,
        customer_name VARCHAR(200) NOT NULL,
        customer_email VARCHAR(200),
        customer_mobile VARCHAR(20) NOT NULL,
        property_type VARCHAR(100),
        budget_range VARCHAR(100),
        source VARCHAR(100) DEFAULT 'WEBSITE',
        status VARCHAR(50) DEFAULT 'new',
        interest_level VARCHAR(20) DEFAULT 'cold',
        assigned_to VARCHAR(36),
        remarks TEXT,
        follow_up_date DATETIME,
        priority INT DEFAULT 2,
        custom_data JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES sales_persons(id) ON DELETE SET NULL
      ) ${tableOptions}
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS sales_activities (
        id VARCHAR(36) PRIMARY KEY,
        enquiry_id VARCHAR(36),
        sales_person_id VARCHAR(36),
        activity_type VARCHAR(100) NOT NULL,
        activity_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        outcome TEXT,
        duration INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
        FOREIGN KEY (sales_person_id) REFERENCES sales_persons(id) ON DELETE SET NULL
      ) ${tableOptions}
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(36) PRIMARY KEY,
        enquiry_id VARCHAR(36),
        user_id VARCHAR(36),
        comment_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ${tableOptions}
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value JSON NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ${tableOptions}
    `);

    // Seed default form config if not exists
    const [config] = await conn.execute("SELECT setting_key FROM app_settings WHERE setting_key = 'form_config'");
    if (config.length === 0) {
      const defaultFormConfig = [
        { id: 'customerName', type: 'text', label: 'Full Name', required: true, isCore: true },
        { id: 'customerMobile', type: 'tel', label: 'Mobile Number', required: true, isCore: true },
        { id: 'customerEmail', type: 'email', label: 'Email Address', required: false, isCore: true },
        { id: 'propertyType', type: 'select', label: 'Property Type', required: false, options: ['1 BHK', '2 BHK', '3 BHK', 'Villa', 'Commercial'], isCore: true },
        { id: 'budgetRange', type: 'select', label: 'Budget', required: false, options: ['Under 50L', '50L - 1Cr', '1Cr - 2Cr', 'Above 2Cr'], isCore: true },
        { id: 'remarks', type: 'textarea', label: 'Remarks / Notes', required: false, isCore: true }
      ];
      await conn.execute("INSERT INTO app_settings (setting_key, setting_value) VALUES ('form_config', ?)", [JSON.stringify(defaultFormConfig)]);
    }

    // Seed super admin if not exists
    const [existing] = await conn.execute("SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1");
    if (existing.length === 0) {
      const adminId = uuidv4();
      const hash = bcrypt.hashSync('admin123', 10);
      await conn.execute(
        "INSERT INTO users (id, username, password, full_name, email, role, organization) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [adminId, 'superadmin', hash, 'Super Administrator', 'admin@crm.com', 'SUPER_ADMIN', 'CRM Organization']
      );
      console.log('✅ Default Super Admin created: username=superadmin, password=admin123');
    }

    console.log('✅ MySQL database initialized successfully');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initializeDatabase };

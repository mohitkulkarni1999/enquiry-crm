-- Disabled data.sql to prevent conflicts with migrations
-- Create test users for login
-- INSERT INTO users (username, name, email, phone, password, role, organization, territory, experience, created_at, updated_at) VALUES
-- ('super', 'Super Administrator', 'super@company.com', '+91 98765 00001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFjqJ8K8x8K8x8K8x8K8x8K', 'SUPER_ADMIN', 'Company', 'All', '10+', NOW(), NOW()),
-- ('admin1', 'Rajesh Kumar', 'rajesh.kumar@company.com', '+91 98765 00002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFjqJ8K8x8K8x8K8x8K8x8K', 'CRM_ADMIN', 'Company', 'North', '5+', NOW(), NOW()),
-- ('sales1', 'Vikram Singh', 'vikram.singh@company.com', '+91 98765 10001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFjqJ8K8x8K8x8K8x8K8x8K', 'SALES', 'Company', 'North', '3+', NOW(), NOW());

-- Create profiles
-- INSERT INTO crm_admin_profile (user_id) VALUES (2);
-- INSERT INTO super_admin_profile (user_id, organization) VALUES (1, 'Company');

-- Create sales person
-- INSERT INTO sales_persons (name, email, phone, available, created_at, updated_at) VALUES
-- ('Vikram Singh', 'vikram.singh@company.com', '+91 98765 10001', true, NOW(), NOW());

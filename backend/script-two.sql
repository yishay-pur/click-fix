-- Migration script to transform existing database structure to Sequelize-compatible format
-- This script migrates from the current schema in script.sql to the structure expected by Sequelize models

-- Start transaction for safety
BEGIN;

-- Step 1: Drop ENUM types (Sequelize uses strings instead)
DROP TYPE IF EXISTS category;
DROP TYPE IF EXISTS area;

-- Step 2: Backup existing data (optional but recommended)
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS employees_backup AS SELECT * FROM employees;
CREATE TABLE IF NOT EXISTS categories_backup AS SELECT * FROM categories;
CREATE TABLE IF NOT EXISTS reviews_backup AS SELECT * FROM reviews;
CREATE TABLE IF NOT EXISTS employee_categories_backup AS SELECT * FROM employee_categories;

-- Step 3: Drop existing tables (will recreate with new structure)
DROP TABLE IF EXISTS employee_categories;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Step 4: Create tables with Sequelize-compatible structure

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT,
    address TEXT,
    last_entrance TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    father_category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    area VARCHAR(255),
    gender VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password TEXT,
    last_entrance TIMESTAMP,
    phone VARCHAR(255) NOT NULL,
    description TEXT,
    years_of_experience INTEGER,
    working_hours JSON,
    services JSON,
    certificates JSON,
    profile_image VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Categories junction table
CREATE TABLE employee_categories (
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, category_id)
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    employee_id INTEGER REFERENCES employees(id),
    category_id INTEGER REFERENCES categories(id),
    price_rate INTEGER,
    service_rate INTEGER,
    performance_rate INTEGER,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    professional_id INTEGER NOT NULL REFERENCES employees(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    answers JSON DEFAULT '[]'::json,
    description TEXT,
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    response_method VARCHAR(50) DEFAULT 'system' CHECK (response_method IN ('system', 'phone')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'rejected', 'expired')),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quote Responses table
CREATE TABLE quote_responses (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id),
    professional_id INTEGER NOT NULL REFERENCES employees(id),
    price DECIMAL(10,2) NOT NULL,
    availability VARCHAR(255) NOT NULL,
    notes TEXT,
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables for complete Sequelize structure (if needed)
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    professional_id INTEGER REFERENCES employees(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    sender_id INTEGER, -- Can reference users or employees
    sender_type VARCHAR(50), -- 'user' or 'employee'
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    employee_id INTEGER REFERENCES employees(id),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    complainant_id INTEGER REFERENCES users(id),
    employee_id INTEGER REFERENCES employees(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Migrate existing data

-- Migrate categories (split name into first_name/last_name for employees, keep as is for categories)
INSERT INTO categories (id, name, description, image, father_category, created_at, updated_at)
SELECT
    id,
    name,
    COALESCE(description, ''),
    COALESCE(image, ''),
    father_category::TEXT,
    created_at,
    updated_at
FROM categories_backup;

-- Migrate users (split name into first_name/last_name)
INSERT INTO users (id, first_name, last_name, email, password, address, last_entrance, created_at, updated_at)
SELECT
    id,
    SPLIT_PART(name, ' ', 1) as first_name,
    CASE WHEN array_length(string_to_array(name, ' '), 1) > 1
         THEN array_to_string((string_to_array(name, ' '))[2:], ' ')
         ELSE '' END as last_name,
    email,
    password,
    address,
    last_entrance,
    created_at,
    updated_at
FROM users_backup;

-- Migrate employees (split name, set defaults for new fields)
INSERT INTO employees (id, first_name, last_name, area, gender, email, password, phone, last_entrance, status, created_at, updated_at)
SELECT
    id,
    SPLIT_PART(name, ' ', 1) as first_name,
    CASE WHEN array_length(string_to_array(name, ' '), 1) > 1
         THEN array_to_string((string_to_array(name, ' '))[2:], ' ')
         ELSE '' END as last_name,
    area::TEXT,
    gender,
    email,
    password,
    phone,
    last_entrance,
    'approved', -- Set existing employees as approved
    created_at,
    updated_at
FROM employees_backup;

-- Migrate employee_categories
INSERT INTO employee_categories (employee_id, category_id)
SELECT employee_id, category_id FROM employee_categories_backup;

-- Migrate reviews
INSERT INTO reviews (id, user_id, employee_id, category_id, price_rate, service_rate, performance_rate, comment, created_at, updated_at)
SELECT id, user_id, employee_id, category_id, price_rate, service_rate, performance_rate, comment, created_at, updated_at
FROM reviews_backup;

-- Step 6: Update sequences for auto-increment
-- Get the maximum IDs and set sequences accordingly
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1);
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 0) + 1);
SELECT setval('employees_id_seq', COALESCE((SELECT MAX(id) FROM employees), 0) + 1);
SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 0) + 1);
SELECT setval('quotes_id_seq', 1);
SELECT setval('quote_responses_id_seq', 1);
SELECT setval('chats_id_seq', 1);
SELECT setval('messages_id_seq', 1);
SELECT setval('notifications_id_seq', 1);
SELECT setval('complaints_id_seq', 1);

-- Step 7: Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_employee_id ON reviews(employee_id);
CREATE INDEX idx_employee_categories_employee_id ON employee_categories(employee_id);
CREATE INDEX idx_employee_categories_category_id ON employee_categories(category_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_professional_id ON quotes(professional_id);
CREATE INDEX idx_quote_responses_quote_id ON quote_responses(quote_id);

-- Step 8: Clean up backup tables (uncomment if you want to remove backups)
-- DROP TABLE users_backup;
-- DROP TABLE employees_backup;
-- DROP TABLE categories_backup;
-- DROP TABLE reviews_backup;
-- DROP TABLE employee_categories_backup;

-- Commit the transaction
COMMIT;

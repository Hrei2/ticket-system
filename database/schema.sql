-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('seller', 'scanner', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TICKETS TABLE
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    birthdate VARCHAR(6) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    is_scanned BOOLEAN DEFAULT FALSE,
    scanned_at TIMESTAMP,
    scanned_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- EVENT SETTINGS TABLE
CREATE TABLE event_settings (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    age_color_ranges JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TICKET HISTORY TABLE (audit log)
CREATE TABLE ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEFAULT EVENT SETTINGS
INSERT INTO event_settings (event_date, age_color_ranges)
VALUES (
    CURRENT_DATE,
    '{"0-15": "#FF6B6B", "16+": "#4CAF50"}'
);

-- Create default admin user (password: admin123)
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2a$10$HRfOg36YCkZkIK1iBC833eFytXOgqao4tGfXclNBcewT6PO/8Wt8W', 'admin');
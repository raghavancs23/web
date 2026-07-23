-- ================================================================
-- EcoTrack - Database Schema (MySQL)
-- Author: Senior Software Architect
-- Version: 1.0.0
-- ================================================================

CREATE DATABASE IF NOT EXISTS ecotrack_db;
USE ecotrack_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_pic VARCHAR(255) DEFAULT NULL,
    eco_score INT DEFAULT 0,
    co2_offset DECIMAL(10,2) DEFAULT 0.00,
    streak_days INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Carbon Calculations Table (Stores each individual run)
CREATE TABLE IF NOT EXISTS carbon_calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bike_km DECIMAL(8,2) DEFAULT 0.00,
    car_km DECIMAL(8,2) DEFAULT 0.00,
    bus_km DECIMAL(8,2) DEFAULT 0.00,
    train_km DECIMAL(8,2) DEFAULT 0.00,
    flight_hours DECIMAL(6,2) DEFAULT 0.00,
    electricity_kwh DECIMAL(10,2) DEFAULT 0.00,
    lpg_kg DECIMAL(8,2) DEFAULT 0.00,
    ac_hours DECIMAL(8,2) DEFAULT 0.00,
    water_liters DECIMAL(10,2) DEFAULT 0.00,
    diet_type VARCHAR(20) DEFAULT 'Vegetarian', -- 'Vegetarian', 'Non-Vegetarian', 'Vegan'
    waste_kg DECIMAL(8,2) DEFAULT 0.00,
    shopping_spend DECIMAL(10,2) DEFAULT 0.00,
    total_emissions DECIMAL(12,2) NOT NULL, -- Total calculated CO2 in kg
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. AI Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tips_text TEXT NOT NULL,                  -- General AI suggestions
    energy_saving_tips TEXT,
    water_saving_tips TEXT,
    eco_alternatives TEXT,
    weekly_challenges TEXT,
    monthly_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    suggestion TEXT,
    bug_report TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Insert Default Admin User (Password is 'Admin@123' hashed with pbkdf2:sha256)
-- Password hash: 'pbkdf2:sha256:600000$c4Xfgh2Y$d2b380db3625bb441eb3fa7cc30a6e0018f28df1d743a19b8849767df381bb45'
INSERT IGNORE INTO admin (username, email, password_hash) 
VALUES ('admin', 'admin@ecotrack.org', 'pbkdf2:sha256:600000$c4Xfgh2Y$d2b380db3625bb441eb3fa7cc30a6e0018f28df1d743a19b8849767df381bb45');

-- Migration: Create Dashboard Tables (MySQL/PostgreSQL)
-- Description: Creates tables for role-based dynamic dashboard system
-- Requirements: 15.1, 15.2

-- Dashboard Configurations Table
CREATE TABLE IF NOT EXISTS dashboard_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    configuration JSON NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    UNIQUE KEY unique_role_version (role, version),
    INDEX idx_role_active (role, is_active),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Dashboard Preferences Table
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    selected_dashboard_type VARCHAR(50),
    custom_layout JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user (user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dashboard Analytics Table
CREATE TABLE IF NOT EXISTS dashboard_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50),
    dashboard_type VARCHAR(50),
    widget_type VARCHAR(50),
    action_id VARCHAR(100),
    load_time_ms INT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_user_role (user_id, role),
    INDEX idx_widget_type (widget_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

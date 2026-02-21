-- Migration: Create Dashboard Tables (SQLite)
-- Description: Creates tables for role-based dynamic dashboard system
-- Requirements: 15.1, 15.2

-- Dashboard Configurations Table
CREATE TABLE IF NOT EXISTS dashboard_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    configuration TEXT NOT NULL, -- JSON stored as TEXT in SQLite
    is_active INTEGER NOT NULL DEFAULT 1, -- BOOLEAN as INTEGER (0/1)
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by INTEGER,
    UNIQUE(role, version)
);

CREATE INDEX IF NOT EXISTS idx_role_active ON dashboard_configurations(role, is_active);
CREATE INDEX IF NOT EXISTS idx_version ON dashboard_configurations(version);

-- User Dashboard Preferences Table
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    selected_dashboard_type TEXT,
    custom_layout TEXT, -- JSON stored as TEXT in SQLite
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_id ON user_dashboard_preferences(user_id);

-- Dashboard Analytics Table
CREATE TABLE IF NOT EXISTS dashboard_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT,
    dashboard_type TEXT,
    widget_type TEXT,
    action_id TEXT,
    load_time_ms INTEGER,
    metadata TEXT, -- JSON stored as TEXT in SQLite
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_event_type ON dashboard_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_role ON dashboard_analytics(user_id, role);
CREATE INDEX IF NOT EXISTS idx_widget_type ON dashboard_analytics(widget_type);
CREATE INDEX IF NOT EXISTS idx_created_at ON dashboard_analytics(created_at);

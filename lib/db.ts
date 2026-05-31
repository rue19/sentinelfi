import Database from 'better-sqlite3';
import path from 'path';

// Use /tmp in Vercel/Production to avoid read-only filesystem errors
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const dbPath = isVercel 
  ? '/tmp/sentinelfi.db' 
  : path.resolve(process.cwd(), 'sentinelfi.db');

const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    market_id TEXT NOT NULL,        -- e.g. "BTC/USDT PERP" or "*" for all
    condition TEXT NOT NULL,        -- "health_below" | "funding_rate_above" | "unrealized_pnl_below"
    threshold REAL NOT NULL,        -- numeric value for the condition
    action TEXT NOT NULL,           -- "close_position" | "add_margin" | "alert_only"
    action_params TEXT NOT NULL,    -- JSON string, e.g. '{"amount": 50}' for add_margin
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    last_triggered_at TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    market_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,       -- "rule_triggered" | "health_warning" | "action_executed" | "error"
    message TEXT NOT NULL,
    position_snapshot TEXT NOT NULL, -- JSON of position state at time of alert
    rule_id TEXT,                   -- nullable, references rules.id
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS positions_cache (
    wallet_address TEXT NOT NULL,
    market_id TEXT NOT NULL,
    snapshot TEXT NOT NULL,          -- full JSON of position
    narration TEXT,                  -- cached AI narration
    narration_updated_at TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (wallet_address, market_id)
  );
`);

export default db;

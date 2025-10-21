CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT UNIQUE,
  phonePlain TEXT,
  peerCode TEXT UNIQUE,
  barcode16 TEXT UNIQUE,
  registeredOnEventDay INTEGER DEFAULT 0,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS otp_attempts (
  id TEXT PRIMARY KEY,
  phone TEXT,
  code TEXT,
  expiresAt TEXT,
  attemptsCount INTEGER DEFAULT 0,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS event_locations (
  id TEXT PRIMARY KEY,
  name TEXT,
  address TEXT,
  managerUsername TEXT,
  managerPasswordHash TEXT
);

CREATE TABLE IF NOT EXISTS scan_logs (
  id TEXT PRIMARY KEY,
  userId TEXT,
  eventLocationId TEXT,
  scannedBy TEXT,
  scannedAt TEXT
);

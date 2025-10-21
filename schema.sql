CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,                  -- NikanAdm | manager | EventVisitor | VIPGuest
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT UNIQUE,                   -- E.164 (مثلاً +98912...)
  phonePlain TEXT,                     -- شماره بدون کد کشور (برای QR)
  peerCode TEXT UNIQUE,
  barcode16 TEXT UNIQUE,               -- 707... برای Visitor، 708... برای VIP
  passwordHash TEXT,                   -- فقط برای NikanAdm (و در صورت نیاز مدیرها)
  registeredOnEventDay INTEGER DEFAULT 0,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS otp_attempts (
  id TEXT PRIMARY KEY,
  phone TEXT,
  code TEXT,
  expiresAt TEXT,
  consumed INTEGER DEFAULT 0,
  attemptsCount INTEGER DEFAULT 0,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS event_locations (
  id TEXT PRIMARY KEY,
  name TEXT,
  address TEXT,
  managerUsername TEXT UNIQUE,
  managerPasswordHash TEXT
);

CREATE TABLE IF NOT EXISTS scan_logs (
  id TEXT PRIMARY KEY,
  userId TEXT,
  eventLocationId TEXT,
  scannedBy TEXT,                      -- username مدیر
  phoneAtScan TEXT,
  peerCodeAtScan TEXT,
  barcodeAtScan TEXT,
  scannedAt TEXT
);

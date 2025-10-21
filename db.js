const Database = require('better-sqlite3');
const fs = require('fs');

if (!fs.existsSync('promethique.db')) {
  console.log('🆕 Creating database file...');
}
const db = new Database('promethique.db');
module.exports = db;

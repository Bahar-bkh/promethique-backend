const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('./db');

// اجرای schema.sql در شروع
const schema = fs.readFileSync('./schema.sql', 'utf8');
db.exec(schema);

// Seed ادمین اولیه (nikanAdm / nik@N78)
(function seedAdmin(){
  const row = db.prepare("SELECT id FROM users WHERE role='NikanAdm'").get();
  if(!row){
    const id = uuid();
    const hash = bcrypt.hashSync('nik@N78', 10);
    db.prepare(`INSERT INTO users(id, role, firstName, lastName, passwordHash, createdAt)
                VALUES (@id,'NikanAdm','Nikan','Admin',@hash,@now)`)
      .run({ id, hash, now: new Date().toISOString() });
    console.log('✅ Seeded NikanAdm (username: nikanAdm, password: nik@N78)');
  }
})();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const scanRoutes = require('./routes/scan');
const locationsRoutes = require('./routes/locations');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res)=>res.json({ok:true, msg:'Promethique backend running'}));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/locations', locationsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

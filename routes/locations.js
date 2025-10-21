const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const { requireRole } = require('../middlewares/authGuard');

// ایجاد محل رویداد (فقط NikanAdm)
router.post('/', requireRole('NikanAdm'), (req,res)=>{
  const { name, address, managerUsername, managerPassword } = req.body;
  if(!name || !address || !managerUsername || !managerPassword) return res.status(400).json({ ok:false, error:'MISSING_FIELDS' });
  const id = uuid();
  const hash = bcrypt.hashSync(managerPassword, 10);
  db.prepare(`INSERT INTO event_locations(id, name, address, managerUsername, managerPasswordHash)
              VALUES (@id,@n,@a,@u,@h)`)
    .run({ id, n:name, a:address, u:managerUsername, h:hash });
  res.json({ ok:true, id });
});

// لیست محل‌ها (فقط NikanAdm)
router.get('/', requireRole('NikanAdm'), (req,res)=>{
  const rows = db.prepare('SELECT * FROM event_locations').all();
  res.json({ ok:true, rows });
});

module.exports = router;

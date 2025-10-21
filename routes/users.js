const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuid } = require('uuid');
const { requireRole } = require('../middlewares/authGuard');
const { makePeerCode, makeBarcode16 } = require('../services/idgen');

// پروفایل با id (برای فرانت پروفایل)
router.get('/:id', (req,res)=>{
  const { id } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(id);
  if(!user) return res.status(404).json({ ok:false, error:'NOT_FOUND' });
  res.json({ ok:true, user });
});

// لیست همه کاربران (فقط NikanAdm)
router.get('/', requireRole('NikanAdm'), (req,res)=>{
  const rows = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
  res.json({ ok:true, rows });
});

// افزودن VIP (فقط NikanAdm)
router.post('/vip', requireRole('NikanAdm'), (req,res)=>{
  const { firstName, lastName, phone, email } = req.body;
  if(!firstName || !lastName || !phone) return res.status(400).json({ ok:false, error:'MISSING_FIELDS' });
  const existed = db.prepare('SELECT id FROM users WHERE phone=?').get(phone);
  if(existed) return res.status(400).json({ ok:false, error:'EXISTS' });

  const id = uuid();
  const peer = makePeerCode();
  const bc = makeBarcode16('708'); // VIP
  const phonePlain = phone.replace(/^\+?98/, '').replace(/^\+/, '');

  db.prepare(`INSERT INTO users(id, role, firstName, lastName, email, phone, phonePlain, peerCode, barcode16, registeredOnEventDay, createdAt)
              VALUES (@id,'VIPGuest',@fn,@ln,@em,@ph,@plain,@peer,@bc,0,@now)`)
    .run({ id, fn:firstName, ln:lastName, em:email||null, ph:phone, plain:phonePlain, peer, bc, now:new Date().toISOString() });

  res.json({ ok:true, id });
});

module.exports = router;

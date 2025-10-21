const express = require('express');
const router = express.Router();
const db = require('../db');
const dayjs = require('dayjs');
const { v4: uuid } = require('uuid');
const { makePeerCode, makeBarcode16 } = require('../services/idgen');
const sms = require('../services/sms');
const mail = require('../services/mail');

// درخواست OTP
router.post('/request-otp', (req,res)=>{
  const { phone, countryCode = '+98' } = req.body;
  if(!phone) return res.status(400).json({ ok:false, error:'PHONE_REQUIRED' });

  const code = String(Math.floor(100000 + Math.random()*900000));
  const last = db.prepare('SELECT attemptsCount FROM otp_attempts WHERE phone=? ORDER BY createdAt DESC').get(phone);
  const attemptsCount = (last?.attemptsCount || 0) + 1;

  db.prepare(`INSERT INTO otp_attempts(id, phone, code, expiresAt, consumed, attemptsCount, createdAt)
    VALUES (@id,@phone,@code,@exp,0,@cnt,@now)`)
    .run({
      id: uuid(),
      phone,
      code,
      exp: dayjs().add(5,'minute').toISOString(),
      cnt: attemptsCount,
      now: new Date().toISOString()
    });

  sms.send(phone, `[DEV] Promethique OTP: ${code}`);
  res.json({ ok:true });
});

// تأیید OTP
router.post('/verify-otp', (req,res)=>{
  const { phone, code } = req.body;
  const row = db.prepare('SELECT * FROM otp_attempts WHERE phone=? ORDER BY createdAt DESC').get(phone);
  if(!row || row.code !== code) return res.status(400).json({ ok:false, error:'INVALID_OTP' });
  if(dayjs().isAfter(dayjs(row.expiresAt))) return res.status(400).json({ ok:false, error:'EXPIRED_OTP' });

  const user = db.prepare('SELECT * FROM users WHERE phone=?').get(phone);
  if(user) return res.json({ ok:true, already:true, userId: user.id });
  return res.json({ ok:true, already:false });
});

// ثبت‌نام نهایی
router.post('/register', (req,res)=>{
  const { firstName, lastName, phone, email, countryCode = '+98' } = req.body;
  if(!firstName || !lastName || !phone) return res.status(400).json({ ok:false, error:'MISSING_FIELDS' });

  const existed = db.prepare('SELECT id FROM users WHERE phone=?').get(phone);
  if(existed) return res.status(400).json({ ok:false, error:'ALREADY_REGISTERED' });

  const id = uuid();
  const peerCode = makePeerCode();
  const barcode16 = makeBarcode16('707');
  const phonePlain = phone.replace(/^\+?98/, '').replace(/^\+/, '');

  db.prepare(`INSERT INTO users(id, role, firstName, lastName, email, phone, phonePlain, peerCode, barcode16, registeredOnEventDay, createdAt)
    VALUES (@id,'EventVisitor',@fn,@ln,@em,@ph,@plain,@peer,@bc,0,@now)`)
    .run({
      id, fn:firstName, ln:lastName, em:email || null,
      ph:phone, plain:phonePlain, peer:peerCode, bc:barcode16,
      now:new Date().toISOString()
    });

  try{ sms.send(phone, 'ثبت نام شما در پرومتیک انجام شد.'); }catch(e){}
  try{ if(email) mail.send(email, 'Promethique', 'Your registration is complete.'); }catch(e){}

  res.json({ ok:true, userId: id, message:'REGISTERED' });
});

module.exports = router;

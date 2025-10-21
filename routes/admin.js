const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { requireRole } = require('../middlewares/authGuard');

// لاگین: هم برای NikanAdm و هم برای manager
router.post('/login', (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ ok:false, error:'MISSING_CREDENTIALS' });

  // 1) اگر ادمین
  if(username === 'nikanAdm'){
    const admin = db.prepare("SELECT * FROM users WHERE role='NikanAdm'").get();
    if(!admin) return res.status(400).json({ ok:false, error:'NO_ADMIN' });
    if(!bcrypt.compareSync(password, admin.passwordHash || '')) return res.status(401).json({ ok:false, error:'BAD_PASSWORD' });

    const token = jwt.sign({ id: admin.id, role:'NikanAdm', username:'nikanAdm' }, process.env.JWT_SECRET || 'devsecret', { expiresIn:'7d' });
    return res.json({ ok:true, token });
  }

  // 2) اگر مدیرِ یک محل رویداد
  const loc = db.prepare('SELECT * FROM event_locations WHERE managerUsername=?').get(username);
  if(!loc) return res.status(404).json({ ok:false, error:'NO_SUCH_MANAGER' });
  if(!bcrypt.compareSync(password, loc.managerPasswordHash || '')) return res.status(401).json({ ok:false, error:'BAD_PASSWORD' });

  const token = jwt.sign({ role:'manager', username, eventLocationId: loc.id }, process.env.JWT_SECRET || 'devsecret', { expiresIn:'7d' });
  return res.json({ ok:true, token, eventLocationId: loc.id });
});

// خلاصه آمار (فقط ادمین)
router.get('/summary', requireRole('NikanAdm'), (req,res)=>{
  const totalScans = db.prepare('SELECT COUNT(*) as c FROM scan_logs').get().c;
  const totalLocations = db.prepare('SELECT COUNT(*) as c FROM event_locations').get().c;
  const preRegistered = db.prepare("SELECT COUNT(*) as c FROM users WHERE role IN ('EventVisitor','VIPGuest') AND registeredOnEventDay=0").get().c;
  const eventDayRegistered = db.prepare("SELECT COUNT(*) as c FROM users WHERE registeredOnEventDay=1").get().c;
  res.json({ ok:true, totalScans, totalLocations, preRegistered, eventDayRegistered });
});

module.exports = router;

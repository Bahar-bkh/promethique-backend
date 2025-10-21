const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuid } = require('uuid');
const dayjs = require('dayjs');
const { requireRole } = require('../middlewares/authGuard');
const { makePeerCode, makeBarcode16 } = require('../services/idgen');

// اسکن: payload می‌تونه phonePlain یا barcode16 باشه
router.post('/', requireRole('manager'), (req,res)=>{
  const { payload } = req.body;
  const { eventLocationId, username } = req.user;
  if(!payload || !eventLocationId) return res.status(400).json({ ok:false, error:'MISSING_DATA' });

  let user = null;
  if(/^70[78]\d{13}$/.test(payload)){
    user = db.prepare('SELECT * FROM users WHERE barcode16=?').get(payload);
  } else {
    user = db.prepare('SELECT * FROM users WHERE phonePlain=?').get(payload);
  }

  if(!user){
    // ثبت سریع در روز ایونت
    const id = uuid();
    const peer = makePeerCode();
    const bc = makeBarcode16('707');
    db.prepare(`INSERT INTO users(id, role, phonePlain, peerCode, barcode16, registeredOnEventDay, createdAt)
                VALUES (@id, 'EventVisitor', @p, @peer, @bc, 1, @now)`)
      .run({ id, p: payload, peer, bc, now: new Date().toISOString() });
    user = db.prepare('SELECT * FROM users WHERE id=?').get(id);
  }

  db.prepare(`INSERT INTO scan_logs(id, userId, eventLocationId, scannedBy, phoneAtScan, peerCodeAtScan, barcodeAtScan, scannedAt)
              VALUES (@id,@uid,@loc,@who,@ph,@peer,@bc,@at)`)
    .run({
      id: uuid(),
      uid: user.id,
      loc: eventLocationId,
      who: username,
      ph: user.phonePlain || user.phone || '',
      peer: user.peerCode || '',
      bc: user.barcode16 || '',
      at: dayjs().toISOString()
    });

  res.json({ ok:true, userId: user.id });
});

// لیست اسکن‌های من (مدیر فقط محل خودش را می‌بیند)
router.get('/my', requireRole('manager'), (req,res)=>{
  const { eventLocationId } = req.user;
  const rows = db.prepare('SELECT * FROM scan_logs WHERE eventLocationId=? ORDER BY scannedAt DESC').all(eventLocationId);
  res.json({ ok:true, rows });
});

module.exports = router;

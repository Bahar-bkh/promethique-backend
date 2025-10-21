const jwt = require('jsonwebtoken');

function authGuard(req, res, next){
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if(!token) return res.status(401).json({ ok:false, error:'NO_TOKEN' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = payload; // { id, role, username, eventLocationId? }
    next();
  }catch(e){
    return res.status(401).json({ ok:false, error:'BAD_TOKEN' });
  }
}

function requireRole(role){
  return (req,res,next)=>{
    authGuard(req,res,()=>{
      if(req.user.role === role || req.user.role === 'NikanAdm') return next();
      return res.status(403).json({ ok:false, error:'FORBIDDEN' });
    });
  };
}

module.exports = { authGuard, requireRole };

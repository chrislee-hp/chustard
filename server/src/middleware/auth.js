const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'table-order-secret-key';

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token required' } });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
  };
}

module.exports = { authMiddleware, JWT_SECRET };

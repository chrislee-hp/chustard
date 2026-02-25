import jwt from 'jsonwebtoken';

export function authMiddleware(jwtSecret) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;
    const tokenStr = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;

    if (!tokenStr) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
    }

    try {
      const decoded = jwt.verify(tokenStr, jwtSecret);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
  };
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }
  next();
}

export function requireTable(req, res, next) {
  if (req.user?.role !== 'table') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Table access required' } });
  }
  next();
}

import jwt from 'jsonwebtoken';

export function authMiddleware(jwtSecret) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
    }

    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, jwtSecret);
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

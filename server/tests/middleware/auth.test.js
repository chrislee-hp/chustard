const { authMiddleware } = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../src/middleware/auth');

describe('authMiddleware', () => {
  const mockRes = () => { const r = { status: jest.fn(() => r), json: jest.fn(() => r) }; return r; };
  const mockNext = jest.fn();

  beforeEach(() => mockNext.mockClear());

  test('토큰 없으면 401', () => {
    const req = { headers: {}, query: {} };
    const res = mockRes();
    authMiddleware('admin')(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('잘못된 토큰 401', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = mockRes();
    authMiddleware('admin')(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('role 불일치 403', () => {
    const token = jwt.sign({ role: 'table', storeId: 's1' }, JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    authMiddleware('admin')(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('유효한 토큰 + 올바른 role → next()', () => {
    const token = jwt.sign({ role: 'admin', storeId: 's1' }, JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    authMiddleware('admin')(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.user.role).toBe('admin');
  });

  test('role 미지정 시 모든 role 허용', () => {
    const token = jwt.sign({ role: 'table', storeId: 's1' }, JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    authMiddleware()(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});

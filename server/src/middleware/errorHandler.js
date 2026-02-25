export function errorHandler(err, req, res, next) {
  const errorMap = {
    UNAUTHORIZED: 401,
    LOGIN_LOCKED: 423,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    CATEGORY_HAS_MENUS: 400
  };

  const status = errorMap[err.message] || 500;
  const code = err.message in errorMap ? err.message : 'INTERNAL_ERROR';

  res.status(status).json({ error: { code, message: err.message } });
}

export function errorHandler(err, req, res, next) {
  const errorMap = {
    UNAUTHORIZED: 401,
    LOGIN_LOCKED: 423,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    CATEGORY_HAS_MENUS: 400,
    INVALID_IMAGE_URL_FORMAT: 400,
    IMAGE_NOT_FOUND: 400,
    IMAGE_VALIDATION_TIMEOUT: 408,
    IMAGE_VALIDATION_FAILED: 400
  };

  const status = errorMap[err.message] || 500;
  const code = err.message in errorMap ? err.message : 'INTERNAL_ERROR';

  if (status === 500) {
    console.error('[ERROR]', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      error: err.stack || err.message
    });
  }

  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(status).json({ error: { code, message } });
}

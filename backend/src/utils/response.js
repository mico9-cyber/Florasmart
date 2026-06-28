export function successResponse(res, { statusCode = 200, message = 'OK', data = null, meta = null }) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function errorResponse(res, { statusCode = 500, message = 'Internal Server Error', code = 'INTERNAL_SERVER_ERROR', details = null }) {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
  });
}


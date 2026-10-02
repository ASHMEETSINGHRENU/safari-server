export const errorHandler = (err, req, res, next) => {
  // 4xx errors are expected control flow (CORS rejection, validation), so they log
  // as warnings and must not carry a stack.
  const isClientError = err.status >= 400 && err.status < 500;
  if (isClientError) console.warn('[Error Handler]', err.message);
  else console.error('[Error Handler]', err.stack || err.message);

  const statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    stack: isClientError || process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

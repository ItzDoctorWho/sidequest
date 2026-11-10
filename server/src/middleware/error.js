// Errors that mean "we can't reach MongoDB", as opposed to a bug in a request.
const DB_UNAVAILABLE_ERRORS = new Set([
  'MongooseServerSelectionError',
  'MongoServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError'
]);

const isDatabaseUnavailable = (err) =>
  DB_UNAVAILABLE_ERRORS.has(err?.name) || /buffering timed out/i.test(err?.message || '');

// Central error handling middleware
export const errorHandler = (err, req, res, next) => {
  if (isDatabaseUnavailable(err)) {
    console.error(`[Database] Unreachable while handling ${req.method} ${req.originalUrl}: ${err.message}`);
    return res.status(503).json({
      message: "We can't reach the database right now. Please try again in a moment."
    });
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  const response = {
    message: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

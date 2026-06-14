function logError(err, req, res, next) {
  console.error(`[Error Log]: ${err.message}`);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack
  });
}

module.exports = { logError, errorHandler };
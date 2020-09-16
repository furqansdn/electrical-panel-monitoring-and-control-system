const ErrorHandler = require('../utils/errorHandler');

const handleCastErrorDB = (err) => {
  const message = `Data Invalid ${err.path} : ${err.value}.`;
  return new ErrorHandler(message, 400);
};

const handleDuplicateField = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplikat Data : ${value}. Gunakan data lain`;

  return new ErrorHandler(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ErrorHandler(message, 400);
};

const sendErrorDevelopment = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Kesalahan Pada Sistem!!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateField(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProduction(error, req, res);
  }
};

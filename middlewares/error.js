const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
  //display for developers
  let error = { ...err };
  error.message = err.message;
  //mongoose error for object Id AND casting errors
  if (err.name === 'CastError') {
    let message = `The Resourse is not found by id ${error.value}`;
    error = new ErrorResponse(message, 404);
  }
  //mongoose error duplicated
  if (err.code === 11000) {
    let message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  //mongoose Error Validation
  console.log(err.name);
  if (err.name === 'ValidationError') {
    let message = Object.values(err.errors).map((val) => val.message);
    console.log(message);
    error = new ErrorResponse(message, 400);
  }
  //return errors message and status code with errors
  res.status(error.statusCode || 500).json({
    success: false,
    errorMessage: error.message || 'Server Error',
  });
};

module.exports = errorHandler;

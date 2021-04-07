const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async.js');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

const protector = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } /* else if(req.cookies.token) {
        token = req.cookies.token;
    } */

  //if there is no token
  if (!token) {
    return next(new ErrorResponse('not authorize to access this route', 401));
  }

  try {
    //verify jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded._id);
    console.log(req.user);
    next();
  } catch (err) {
    next(new ErrorResponse('not authorize to access this route', 401));
  }
});

// only publisher and admin can edit the bootcamps and courses
const authorized = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protector, authorized };

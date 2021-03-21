const asyncHandler = require('../middlewares/async');
const errorHandler = require('../utils/errorResponse');
const User = require('../models/users');

//@desc               login new user
//@route              Post /api/v1/users/register
//@access             public
const register = asyncHandler(async (req, res, next) => {
  //create user
  let user = await User.create(req.body);
  //get the token
  let token = user.signWebToken();
  //response to client
  res.status(200).json({
    success: true,
    token,
    data: user
  });
});

//@desc               login  user
//@route              Post /api/v1/users/login
//@access             public
const login = asyncHandler(async (req, res, next) => {
  //run some validation
  let { email, password } = req.body;
  console.log(req.body);
  //the data must sumbitted
  if (!email || !password) {
    return next(new errorHandler('please submit your email and password'), 400);
  }

  //check the user exist with that email
  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new errorHandler('Invalid credintals'), 401);
  }

  //check if the password is correct or not
  const isMatch = await user.isMatch(password);
  if (!isMatch) {
    return next(new errorHandler('Invalid credintals'), 401);
  }

  const token = user.signWebToken();

  res.status(200).json({
    success: true,
    token
  });
});

module.exports = { register, login };

const errorHandler = require('../utils/errorResponse');
const User = require('../models/users');
const asyncHanlder = require('../middlewares/async');

//@desc             register new user
//@route            POST /api/v1/auth/register
//@accress          Public
const register = asyncHanlder(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  //create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });
  //get token from method schema
  sendTokenResponse(user, 200, res);
});

//@desc             login to the exist account
//@route            POST /api/v1/auth/login
//@accress          Public
const login = asyncHanlder(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email and password
  if (!email || !password) {
    return next(new errorHandler('please provide the email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  //check if the user exist with that email
  if (!user) {
    return next(new errorHandler('Invalid credintals', 401));
  }

  //check if the password is correct
  let isMatch = await user.isMatchPassword(password);
  if (!isMatch) {
    return next(new errorHandler('Invalid credintals', 401));
  }

  sendTokenResponse(user, 200, res);
});
//@desc             get my data
//@route            GET /api/v1/auth/me
//@accress          Private
const getMe = asyncHanlder(async (req, res, next) => {
  //unnecessary code
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

//import the controllers function
module.exports = { register, login, getMe };

//internal function to set Cookies in the header
const sendTokenResponse = (user, statusCode, res) => {
  //get token from method schema
  let token = user.getSignToken();
  //options for sign token in cookie
  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000
    ),
    secure: false
  };

  //if the app on production env will use cookie for https
  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }
  //send response to the client side
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  });
};

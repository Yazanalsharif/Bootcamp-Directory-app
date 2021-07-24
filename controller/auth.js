const errorHandler = require('../utils/errorResponse');
const User = require('../models/users');
const asyncHanlder = require('../middlewares/async');
const sendMail = require('../utils/sendMessage');
const crypto = require('crypto');
const asyncHandler = require('../middlewares/async');

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
    role,
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
    data: user,
  });
});

//@desc             change the password if you forgot it
//@route            GET /api/v1/auth/forgetPassword
//@accress          Public
const forgetPassword = asyncHanlder(async (req, res, next) => {
  //search about the user by the email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new errorHandler('the user is not exist', 404));
  }
  //create the reset password
  const resetToken = user.getResetToken();

  await user.save({ validateBeforeSave: false });
  //create the option for message

  //create the url to forget the password
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;
  //the message will send with the url that will forward the user to reset password page
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  try {
    //option for sendMail function
    const option = {
      to: user.email,
      subject: 'forget Password',
      text: message,
    };

    //call sendMail function
    await sendMail(option);

    res.status(200).json({
      success: true,
      data: 'The Email is Sent, Please Check your Email to reset the password ',
    });
  } catch (err) {
    user.resetToken = undefined;
    user.resetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new errorHandler("the server Could't send an email to this user", 500)
    );
  }
});

//@desc             change the password if you forgot it
//@route            PUT /api/v1/auth/forgetPassword/Token
//@accress          Public
const updatePassword = asyncHanlder(async (req, res, next) => {
  const resetToken = req.params.token;

  const token = crypto.createHash('sha256').update(resetToken).digest('hex');
  //get the user by using reset token password
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gte: Date.now() },
  });

  if (!user) {
    return next(new errorHandler('Invalid Token, please try again later', 400));
  }
  //set new properties to the user document
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendTokenResponse(user, 200, res);
});

//@desc             clear cookies after logout
//@route            get /api/v1/auth/logout
//@accress          Public
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    msg: 'the account loged out',
    data: {},
  });
});
//import the controllers function
module.exports = {
  register,
  login,
  getMe,
  forgetPassword,
  updatePassword,
  logout,
};

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
    secure: false,
  };

  //if the app on production env will use cookie for https
  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }
  //send response to the client side
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

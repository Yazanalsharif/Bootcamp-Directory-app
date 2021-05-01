const User = require('../models/users');
const ErrorHandler = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

//@desc                  get specific user in the system
//@route                 GET /api/v1/users/:id
//@access                PRIVATE/ADMIN
const getUserById = asyncHandler(async (req, res, next) => {
  //find the user directly
  const user = await User.findById(req.params.id);
  console.log('hello dears');
  if (!user) {
    return next(new ErrorHandler("the User does't not Exist", 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});
//@desc                  get all users in the system
//@route                 GET /api/v1/users
//@access                PRIVATE/ADMIN
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    data: res.advanceResult
  });
});

//@desc                  create account by admin
//@route                 POST /api/v1/users/register
//@access                PRIVATE/ADMIN
const createAccount = asyncHandler(async (req, res, next) => {
  //email, password, role, name
  const { email, name, role, password } = req.body;

  const user = await User.create({ email, name, role, password });
  res.status(200).json({
    success: true,
    msg: `the account register in with email ${user.email}`
  });
});

//@desc                  update the user account
//@route                 PUT /api/v1/users/:id
//@access                PRIVATE/ADMIN
const updateUser = asyncHandler(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('please Enter The User Id', 400));
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidator: true
  });

  res.status(200).json({
    success: true,
    msg: 'the User is Updat',
    data: user
  });
});

//@desc                  delete the user account
//@route                 DELETE /api/v1/users/:id
//@access                PRIVATE/ADMIN
const deleteUser = asyncHandler(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('please Enter The User Id', 400));
  }

  const user = await User.findByIdAndRemove(req.params.id);

  res.status(200).json({
    success: true,
    msg: 'the User is deleted',
    data: user
  });
});

//@desc                  update the password
//@route                 PUT /api/v1/users/updatePassword
//@access                PRIVATE
const updatePassword = asyncHandler(async (req, res, next) => {
  //the user must send old password and new one
  const { oldPassword, newPassword } = req.body;

  //get the user that want to update his password
  const user = await User.findById(req.user.id).select('+password');
  //check if the old password is correct
  if (!(await user.isMatchPassword(oldPassword))) {
    return next(
      new ErrorHandler('The old password is not correct please', 400)
    );
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    msg: 'The Password is updated',
    data: user
  });
});

//@desc                  update the details of the users like name or password
//@route                 PUT /api/v1/users/updateDetails
//@access                PRIVATE
const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };
  //there is no to vaildate any thing
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    msg: 'the update is done',
    data: user
  });
});
module.exports = {
  createAccount,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updatePassword,
  updateDetails
};

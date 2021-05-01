const express = require('express');
const {
  register,
  login,
  getMe,
  forgetPassword,
  updatePassword
} = require('../controller/auth.js');

const router = express.Router();

//pring function from middlewares
const { protector } = require('../middlewares/auth');

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/me').get(protector, getMe);

router.route('/forgetPassword').post(forgetPassword);

router.route('/resetPassword/:token').put(updatePassword);

module.exports = router;

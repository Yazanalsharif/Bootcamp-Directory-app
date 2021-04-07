const express = require('express');
const { register, login, getMe } = require('../controller/auth.js');

const router = express.Router();

//pring function from middlewares
const { protector } = require('../middlewares/auth');

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/me').get(protector, getMe);

module.exports = router;

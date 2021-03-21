const express = require('express');

//bring auth controller
const { register, login } = require('../controller/auth');

const router = express.Router();

//route register endpoint
router.route('/register').post(register);
//router login endpoint
router.route('/login').post(login);

module.exports = router;

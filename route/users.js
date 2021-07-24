const express = require('express');

//controllers
const {
  createAccount,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
  updateDetails,
} = require('../controller/users');

//middlewares
const { protector, authorized } = require('../middlewares/auth');
const advanceResult = require('../middlewares/advanceResult');

//models
const User = require('../models/users');

const router = express.Router();
//to user protector middle ware in every single route in the file
router.use(protector);
//route the controllers funcitons that will executed by the user himself
router.route('/updatePassword').put(updatePassword);
router.route('/updateDetails').put(updateDetails);

//user authorized middleware in every route used by the admin only
router.use(authorized('admin'));

//route the controllers funcitons that will executed by the admin
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

router.route('/').get(advanceResult(User), getUsers);

//register router and only can use this route is the admin
router.route('/register').post(createAccount);
//export the router to the server file
module.exports = router;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'please submit your name']
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'please use validaiton email'
    ]
  },
  role: {
    type: String,
    trim: true,
    default: 'user',
    enum: ['user', 'publisher']
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
//hashing the password before the saving the docu
UserSchema.pre('save', async function (next) {
  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//create a method called from user document
UserSchema.methods.signWebToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP
  });
  return token;
};
//method to compare the passowrd return true or false
UserSchema.methods.isMatch = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

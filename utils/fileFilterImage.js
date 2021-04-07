const errorResponse = require('./errorResponse');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

//filter the file and only accept the images extentions
const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    return cb(new errorResponse('Only images file are allowed', 400), false);
  }
  cb(undefined, true);
};

//make the avater name depends on id of the user
const handleFileName = (req, file, cb) => {
  let urlArray = req.url.split('/');
  let filename = urlArray[urlArray.length - 1];
  cb(undefined, `photo_${filename}${path.parse(file.originalname).ext}`);
};

//where the avaters will storing
const distination = (req, file, cb) => {
  cb(undefined, process.env.PATH_FILE);
};

module.exports = { imageFilter, handleFileName, distination };

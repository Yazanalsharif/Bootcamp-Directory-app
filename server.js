const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const chalk = require('chalk');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const handlingFile = require('./utils/fileFilterImage');
//route files
const bootcamps = require('./route/bootcamps');
const courses = require('./route/courses');
const auth = require('./route/auth');
const users = require('./route/users');
//load env variables
dotenv.config({ path: './config/config.env' });
connectDB();

//bring app from express library
const app = express();

//setup json request
app.use(express.json());
//setup cookie parser
app.use(cookieParser());
//@desc       get the logger data from the user in dev env
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//handling path in public
app.use(express.static(path.join(__dirname, './public')));

//handling upload images middleware
//add limits opt to limit the size of function
let storage = multer.diskStorage({
  //function to store the image with the extention
  filename: handlingFile.handleFileName,
  //function to store the image in specific folder
  destination: handlingFile.distination
});

//handling upload function middle ware
const upload = multer({
  storage: storage,
  fileFilter: handlingFile.imageFilter,
  limits: {
    fileSize: process.env.MAX_FILE_UPLOAD,
    fieldSize: process.env.MAX_FILE_UPLOAD
  }
});

//setup multer middleware
app.use(upload.single('avater'));
//Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
//put the valide url
app.use('/api/v1/users', users);
//error handler must be after the routes.
app.use(errorHandler);
const port = process.env.PORT || 3000;

//make the server listen to specific routes
const server = app.listen(port, () => {
  console.log(
    chalk.bold.yellow(
      `the Server running In ${process.env.NODE_ENV} on port ${port}`
    )
  );
});

//handle unhandledRejection error
process.on('unhandledRejection', (err, promise) => {
  console.log(chalk.bold.red(`Error: ${err.message}`));
  //close and make the process return fail when the server closed
  server.close(() => process.exit(1));
});

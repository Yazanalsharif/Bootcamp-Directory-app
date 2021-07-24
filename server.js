//built-in library that use to simplify the processing with path
const path = require('path');
//web enviorment
const express = require('express');
//give access to the .env file that exist in config folder
const dotenv = require('dotenv');
//logger the request of http (give the data of the request)
const morgan = require('morgan');
//create connection with database
const connectDB = require('./config/db');
//middleware to handle the errors and exceptions easly
const errorHandler = require('./middlewares/error');
//colorize the result from terminal or cmd
const chalk = require('chalk');
//handle image by multer library and its the best
const multer = require('multer');
//cookie to store the login token
const cookieParser = require('cookie-parser');
//filtering the image and create the extentions etc
const handlingFile = require('./utils/fileFilterImage');

//security stuff
//to protect the app from NOSQL injection
//you can check the mongo Doc for more Infotmation about NOSQL INJECTION
const expressSanitize = require('express-mongo-sanitize');
//add some http header to make the app more secure its not a silver bullet but it can help
const helmet = require('helmet');
//save the app from cross-scripting Site
const xssCleaner = require('xss-clean');
//this package to limit the request per amount of time
const rateLimit = require('express-rate-limit');
//this package to protect the app from http parametters
const hpp = require('hpp');
//this package to allow other domains to take data from api
const cors = require('cors');

//route files
const bootcamps = require('./route/bootcamps');
const courses = require('./route/courses');
const auth = require('./route/auth');
const users = require('./route/users');
const review = require('./route/review');

//load env variables
dotenv.config({ path: './config/config.env' });
connectDB();

//bring app from express library
const app = express();

//setup json request
app.use(express.json());
//setup cookie parser
app.use(cookieParser());
/* adding Security middle ware here  */
//security middle ware
app.use(expressSanitize());
//setup helmet to the app
app.use(helmet());
app.use(xssCleaner());
app.use(cors());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

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
  destination: handlingFile.distination,
});

//handling upload function middle ware
const upload = multer({
  storage: storage,
  fileFilter: handlingFile.imageFilter,
  limits: {
    fileSize: process.env.MAX_FILE_UPLOAD,
    fieldSize: process.env.MAX_FILE_UPLOAD,
  },
});

//setup multer middleware
app.use(upload.single('avater'));

//Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reviews', review);
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

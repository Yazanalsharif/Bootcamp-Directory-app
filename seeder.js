const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const chalk = require('chalk');

//load dotenv variables
dotenv.config({ path: `./config/config.env` });

//create a connection with db
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});

//get data from files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);
//bring models
const Bootcamp = require('./models/bootcamps');
const Course = require('./models/courses');
const User = require('./models/users');

//import data from json files
const importdata = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    console.log(chalk.green.bold('the data imported'));
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
//delete all data from database
const deletData = async () => {
  try {
    await Bootcamp.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});
    console.log(chalk.red.bold(`the data is deleted`));
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//to get arguments from developer
if (process.argv[2] === '-i') {
  importdata();
} else if (process.argv[2] === '-d') {
  deletData();
}
//0x80c67a1d2a5ffc9281c38dedc9ed82aa5481fd18
//0xe90fb1b76f88e91024f8cf58b78901af2ee7b5cd
//0xfd4120d697b48a806c8a30284a54ebc7df3c7bf3
//0xec490b0fab1a1584cefdcd7ea152e8c5ecb4f690
//0xa02c6008e54003e3eb5f9d155478a0180f79d2a7
//0xd3b42fa9b6031bae59ddd362b8778ec916736f00

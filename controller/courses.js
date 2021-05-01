const Course = require('../models/courses');
const asyncHandler = require('../middlewares/async');
const errorHandler = require('../utils/errorResponse');
const Bootcamp = require('../models/bootcamps');

//@desc           get all courses either for specific bootcams or all courses in database
//route           GET api/v1/courses
//route           GET api/v1/bootcamps/:bootcampId/courses
//access          Public
const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId
    }).populate({
      path: 'bootcamp',
      select: 'name'
    });
    //send the data to client
    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advanceResult);
  }
});

//@desc           get specific course by course Id
//route           GET api/v1/courses/:id
//access          Public
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new errorHandler(`no course exist with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc           create specific course to specific bootcamp
//route           POST api/v1/bootcamps/:bootcampId/courses
//access          Private
const createCourse = asyncHandler(async (req, res, next) => {
  //add bootcamp id to the object that i will use to add course
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.body.bootcamp);
  //check the bootcmap is exist or not
  if (!bootcamp) {
    return next(
      new errorHandler(`there is no bootcamp with id ${req.body.bootcamp}`, 400)
    );
  }

  //check if the owner of the bootcamp is the user authinteceded
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorHandler(
        `you are not the owner of the bootcamp, only the owner of the bootcmap can added courses to it`,
        403
      )
    );
  }
  //add some logical opperating to make sure you can't add two same courses
  const course = await Course.create(req.body);
  res.status(201).json({
    success: true,
    data: course
  });
});
//@desc           delete specific course
//route           DELETE api/v1/courses/:id
//access          Private
const deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new errorHandler(`The course not exist wiht id ${req.params.id}`, 400)
    );
  }

  //check if the owner of the course is the user authinteceded
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorHandler(
        `you are not the owner of the course, only the owner of the course can delete it`,
        403
      )
    );
  }

  await course.remove(course);

  res.status(200).json({
    success: true,
    data: course
  });
});

//@desc           update specific course
//route           UPDATE api/v1/courses/:id
//access          Private
const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new errorHandler(`The course not exist with id ${req.params.id}`, 400)
    );
  }

  //check if the owner of the course is the user authinteceded
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorHandler(
        `you are not the owner of the course, only the owner of the course can delete it`,
        403
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse
};

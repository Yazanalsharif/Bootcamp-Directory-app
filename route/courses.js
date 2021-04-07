const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse
} = require('../controller/courses');

//bring course model
const Course = require('../models/courses');

//bring advance result middle
const advanceResults = require('../middlewares/advanceResult');

const router = express.Router({ mergeParams: true });

//called functions from auth middleware
const { protector, authorized } = require('../middlewares/auth');

router
  .route('/')
  .get(
    advanceResults(Course, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getCourses
  )
  .post(protector, authorized('publisher', 'admin'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .delete(protector, authorized('publisher', 'admin'), deleteCourse)
  .put(protector, authorized('publisher', 'admin'), updateCourse);

module.exports = router;

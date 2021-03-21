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

router
  .route('/')
  .get(
    advanceResults(Course, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getCourses
  )
  .post(createCourse);

router.route('/:id').get(getCourse).delete(deleteCourse).put(updateCourse);

module.exports = router;

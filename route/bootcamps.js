const express = require('express');
const bootcampController = require('../controller/bootcamps');

//include other resource routers
const courses = require('./courses');

const router = express.Router();
//bring the advance middle ware in bootcamp route
const advanceResult = require('../middlewares/advanceResult');
// bring bootcamp model to use it in middle ware
const Bootcamp = require('../models/bootcamps');
// re-route into other resource routes
router.use('/:bootcampId/courses', courses);

router
  .route('/radius/:zipcode/:distance')
  .get(bootcampController.getBootcampWithinRadius);

router
  .route('/')
  .get(advanceResult(Bootcamp, 'courses'), bootcampController.getBootcamps)
  .post(bootcampController.createBootcamp);

router
  .route('/:id')
  .get(bootcampController.getBootcamp)
  .put(bootcampController.updateBootcamp)
  .delete(bootcampController.deleteBootcamp);

router.route('/upload/:id').put(bootcampController.uploadBootcampAvater);

module.exports = router;

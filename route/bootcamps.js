const express = require('express');
const bootcampController = require('../controller/bootcamps');

//include other resource routers
const courses = require('./courses');
const reviews = require('./review');

const router = express.Router();

//called functions from auth middleware
const { protector, authorized } = require('../middlewares/auth');

//bring the advance middle ware in bootcamp route
const advanceResult = require('../middlewares/advanceResult');

// bring bootcamp model to use it in middle ware
const Bootcamp = require('../models/bootcamps');

// re-route into other resource routes
router.use('/:bootcampId/courses', courses);
router.use('/:bootcampId/reviews', reviews);
//route to upload the avater to the bootcamp
router
  .route('/upload/:id')
  .put(
    protector,
    authorized('publisher', 'admin'),
    bootcampController.uploadBootcampAvater
  );

router
  .route('/radius/:zipcode/:distance')
  .get(bootcampController.getBootcampWithinRadius);

router
  .route('/')
  .get(advanceResult(Bootcamp, 'courses'), bootcampController.getBootcamps)
  .post(
    protector,
    authorized('publisher', 'admin'),
    bootcampController.createBootcamp
  );

router
  .route('/:id')
  .get(bootcampController.getBootcamp)
  .put(
    protector,
    authorized('publisher', 'admin'),
    bootcampController.updateBootcamp
  )
  .delete(
    protector,
    authorized('publisher', 'admin'),
    bootcampController.deleteBootcamp
  );

module.exports = router;

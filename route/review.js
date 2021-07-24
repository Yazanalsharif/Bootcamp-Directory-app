const express = require('express');

const router = express.Router({ mergeParams: true });
//models
const Review = require('../models/Review');
//middlewares
const advanceResult = require('../middlewares/advanceResult');
const { protector, authorized } = require('../middlewares/auth');

//get the controller functions
const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controller/review');

//routers
router
  .route('/')
  .get(
    advanceResult(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protector, authorized('user', 'admin'), createReview);

router
  .route('/:id')
  .get(getReview)
  .put(protector, authorized('user', 'admin'), updateReview)
  .delete(protector, authorized('user', 'admin'), deleteReview);
module.exports = router;

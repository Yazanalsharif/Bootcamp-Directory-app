const Review = require('../models/Review');
const Bootcamp = require('../models/bootcamps');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const { findByIdAndRemove } = require('../models/Review');

//@desc           Get the reviews
//route           GET api/v1/reviews
//route           GET api/v1/bootcamps/bootcampId/reviews
//access          Puplic
const getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advanceResult);
  }
});

//@desc           Get the review by id
//route           GET api/v1/reviews
//access          Puplic
const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('The review is not exit', 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});
//@desc           Create review by users
//route           POST api/v1/bootcampId/reviews
//access          Private
const createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  //find the bootcamp if it is exist
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `the bootcamp with id ${req.params.bootcamp} is not exist`
      ),
      400
    );
  }

  const review = await Review.create(req.body);
  res.status(200).json({
    success: true,
    msg: 'the reviews is created',
    data: review,
  });
});

//@desc           update review by users or admins
//route           PUT api/v1/reviews/:id
//access          Private
const updateReview = asyncHandler(async (req, res, next) => {
  //find the review
  const review = await Review.findById(req.params.id);

  //check if it is exist or not
  if (!review) {
    return next(
      new ErrorResponse(`the Review with id ${req.params.id} is not exist`),
      400
    );
  }
  //check if the authrized is the user who create the review or the admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`you are not authorized to reach this route`),
      401
    );
  }

  //update the review
  const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body);
  //send response to the team
  res.status(200).json({
    success: true,
    msg: 'the review is updated',
    data: updatedReview,
  });
});
//@desc           delete review by user or by admin
//route           DELETE api/v1/reviews/:id
//access          Private
//Note            maybe i have to rebuild this function to make it responce for remove Event.
const deleteReview = asyncHandler(async (req, res, next) => {
  //find the reveiw

  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('The Review does not exit', 404));
  }

  if (req.user.id !== review.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('you are not authorized to delete this review', 401)
    );
  }

  await review.remove();

  res.status(200).json({
    success: true,
    msg: 'the review is deleted',
    data: review,
  });
});

module.exports = {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};

const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    data: { reviews }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { newReview }
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.find({ id: req.params.id });

  if (!review) {
    return next(new AppError('No review kekw', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

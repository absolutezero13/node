const express = require('express');
const authController = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
  getReview
} = require('../controllers/reviewController');

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    createReview
  );
router.route('/:id').get(getReview);

module.exports = router;

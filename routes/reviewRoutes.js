const express = require('express');
const authController = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
  getReview,
  deleteReview,
  updateReview,
  setTourUserIds
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    setTourUserIds,
    createReview
  );
router.route('/:id').get(getReview);
router
  .route('/:id')
  .delete(deleteReview)
  .patch(updateReview);

module.exports = router;

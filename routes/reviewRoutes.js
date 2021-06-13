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

router.use(authController.protect);
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
  .patch(authController.restrictTo('user', 'admin'), updateReview);

module.exports = router;

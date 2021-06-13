const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/updateme', userController.updateMe);
router.delete('/deleteme', authController.protect, userController.deleteMe);

router.use(authController.protect); // protects all routes under this

router.patch(
  '/updatepassword/',

  authController.updatePassword
);

router.get(
  '/me',

  userController.getMe,
  userController.getUser
);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

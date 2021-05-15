const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const sendEmail = require('../email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 if email and password exist

  if (!email || !password) {
    return next(new AppError('Provide email or password !', 400));
  }

  //2 cehck user exists and password is cporrect

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  console.log(user);
  //3 if everything ok, send token to client

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token if it exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return next(new AppError('You are not Logged in', 401));
    }
  }

  // validate token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if user still exists

  const currentUser = await User.findById(decoded.id);

  console.log(currentUser);

  if (!currentUser) {
    return next(new AppError('user token not exists'));
  }

  // check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password! login agaimn ', 401)
    );
  }

  // ACCESS FINALLY

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this kekw!')
      );
    } else {
      next();
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 - get user from posted email

  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('there is no user with that email', 404));

  // 2 - generate the random reset token

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3- send it to mail

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch req with your new passowrd and password confir to ${resetURL}. If you didnt forget please ignore this kekw`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset shit',
      message
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('there was an error sending email lol', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
});

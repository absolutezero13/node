const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

// 1) GLOBAL MIDDLEWARES

//  set Security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser, reading data from bodys
app.use(express.json({ limit: '10kb' }));

// data sanitization against noSql query inj (temizleme)

app.use(mongoSanitize());
//script attacks
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty'
    ]
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware (useless)
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP !'
});

// limit requests here
app.use('/api', limiter);

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on server kekw!`), 404);
});

app.use(globalErrorHandler);

module.exports = app;

// HANDLING ERRORS GLOBALLY, NOT RELATED TO EXPRESS

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Dbbb connectt');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('uncaughtException', err => {
  console.log(err.name);

  server.close(() => process.exit(1));
});

process.on('unhandledRejection', err => {
  console.log('Unhandled kekw ! shuw down!');
  console.log(err.name);
  server.close(() => process.exit(1));
});

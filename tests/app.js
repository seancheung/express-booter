const path = require('path');
const boot = require('../src/boot');
const { NotFound } = require('../src/errors');
const app = require('express')();

app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: false }));

boot(path.join(__dirname, './routes'), app);

app.use((req, res, next) => {
  next(new NotFound());
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set http status
  res.status(err.status || 500);

  // send error
  res.json({
    name: err.name,
    status: err.status || 500,
    message: err.message
  });
});

module.exports = app;

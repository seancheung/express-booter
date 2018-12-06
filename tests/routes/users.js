const { Forbidden } = require('../../src/errors');

module.exports = {
  name: '/users',
  middlewares: [
    (req, res, next) => {
      next(new Forbidden());
    }
  ],

  list: {
    name: '/',
    method: 'get',
    handler(req, res) {
      res.json([{}, {}]);
    }
  }
};

const { Forbidden } = require('../../src/errors');

module.exports = {
  list: {
    name: '/',
    method: 'get',
    middlewares: [
      (req, res, next) => {
        next(new Forbidden());
      }
    ],
    handler(req, res) {
      res.json([{}, {}]);
    }
  },

  get: {
    name: '/:id',
    method: 'get',
    handler(req, res) {
      res.json({ id: req.params.id });
    }
  },

  create: {
    name: '/',
    method: 'post',
    handler(req, res) {
      res.status(201).json({});
    }
  },

  update: {
    name: '/:id',
    method: 'put',
    handler(req, res) {
      res.json({ id: req.params.id });
    }
  },

  remove: {
    name: '/:id',
    method: 'delete',
    handler(req, res) {
      res.status(204).end();
    }
  }
};

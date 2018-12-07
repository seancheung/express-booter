const guards = require('../../src/guards');

module.exports = {
  middlewares: [
    guards.headers(['X-ID']),
    guards.auth({
      expand(req) {
        return { id: req.header('x-id') };
      }
    })
  ],

  count: {
    method: 'get',
    handler(req, res) {
      res.json(req.$user);
    }
  },

  list: {
    name: '/',
    method: 'get',
    middlewares: [guards.filter(), guards.sort(), guards.projection(), guards.pagination()],
    handler(req, res) {
      res.json(req.$options);
    }
  },

  get: {
    name: '/:id',
    method: 'get',
    middlewares: [guards.queries(['code'])],
    handler(req, res) {
      res.json({ id: req.params.id, code: req.query.code });
    }
  },

  create: {
    name: '/',
    method: 'post',
    middlewares: [
      guards.body({
        name: 'item name',
        key: data => typeof data === 'number',
        type: {
          message: 'type is required'
        }
      })
    ],
    handler(req, res) {
      res.status(201).json({ name: req.body.name, key: req.body.key });
    }
  },

  update: {
    name: '/:id',
    method: 'put',
    middlewares: [guards.access({ namespace: 'TEST', secret: 'testsecret', key: 'testkey' })],
    handler(req, res) {
      res.json({ id: req.params.id });
    }
  },

  remove: {
    name: '/:id',
    method: 'delete',
    middlewares: [guards.env('production_test')],
    handler(req, res) {
      res.status(204).end();
    }
  }
};

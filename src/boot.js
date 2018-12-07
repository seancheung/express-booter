/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Import controllers
 */
module.exports = (dir, router, options) => {
  const {
    filter = f => /\.js$/.test(f),
    cb = ({ method, url }) => console.log(`mounted route ${method.toUpperCase()} ${url}`),
    safe = true
  } = options || {};

  fs.readdirSync(dir)
    .filter(f => filter.call(null, f))
    .forEach(name => {
      const file = path.join(dir, name);
      const controller = require(file);
      if (typeof controller !== 'object') return;
      const location = (controller.name || path.basename(file, path.extname(file))).toLowerCase();

      Object.keys(controller).forEach(key => {
        let method, url, handler, middlewares;
        if (typeof controller[key] === 'function') {
          switch (key) {
          case 'get':
          case 'put':
          case 'patch':
          case 'post':
          case 'head':
          case 'delete':
            method = key;
            url = `/${location}`;
            break;
          default:
            return;
          }
          handler = controller[key];
        } else if (
          typeof controller[key] === 'object' &&
          typeof controller[key].method === 'string' &&
          typeof controller[key].handler === 'function'
        ) {
          method = controller[key].method.toLowerCase();
          handler = controller[key].handler;
          url = `/${location}/${controller[key].name || key}`
            .replace(/\/{2,}/g, '/')
            .replace(/(.+)\/$/, '$1')
            .toLowerCase();
          middlewares = controller[key].middlewares;
        } else {
          return;
        }
        if (Array.isArray(controller.middlewares)) {
          if (Array.isArray(middlewares)) {
            middlewares = controller.middlewares.concat(middlewares);
          } else {
            middlewares = controller.middlewares;
          }
        }
        if (safe) {
          handler = wrap(handler);
        }
        if (Array.isArray(middlewares)) {
          router[method](url, ...middlewares, handler);
        } else {
          router[method](url, handler);
        }
        if (typeof cb === 'function') {
          cb.call(null, { method: method.toUpperCase(), url });
        }
      });
    });

  return router;
};

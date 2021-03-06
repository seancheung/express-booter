const { BadRequest, Forbidden, Unauthorized } = require('./errors');

function check(value, type) {
  if (typeof type === 'function') {
    switch (type) {
    case String:
      return typeof value === 'string';
    case Number:
      return typeof value === 'number';
    case Boolean:
      return typeof value === 'boolean';
    case Array:
      return Array.isArray(value);
    case Object:
      return typeof value === 'object' && value != null;
    default:
      return type(value);
    }
  }
  if (typeof type === 'object') {
    if (type instanceof RegExp) {
      return type.test(value);
    }
    if (Array.isArray(type)) {
      if (!Array.isArray(value)) {
        return false;
      }
      if (type.length === 1) {
        return value.every(e => check(e, type[0]));
      }
      if (type.length > 1) {
        return value.every((e, i) => type[i] && check(e, type[i]));
      }

      return true;
    }
  }

  return false;
}

function required(context, map) {
  if (Array.isArray(map)) {
    map = map.reduce((t, k) => Object.assign(t, { [k]: k }), {});
  }

  return (req, res, next) => {
    try {
      if (!req[context]) {
        throw new BadRequest(`missing request ${context}`);
      }
      const get = typeof req[context] === 'function' ? k => req[context](k) : k => req[context][k];
      for (const [key, type] of Object.entries(map)) {
        const value = get(key);
        if (typeof type === 'string') {
          if (value !== undefined) {
            continue;
          }
          throw new BadRequest(`${type} is required but missing in ${context}`);
        }
        if (type.validator || type.message !== undefined) {
          if (type.optional && value === undefined) {
            continue;
          }
          if (type.validator) {
            if (check(value, type.validator)) {
              continue;
            }
            if (type.message !== undefined) {
              throw new BadRequest(type.message);
            }
            throw new BadRequest(`invalid ${key} in ${context}`);
          }
          if (value !== undefined) {
            continue;
          }
          if (type.message !== undefined) {
            throw new BadRequest(type.message);
          }
          throw new BadRequest(`invalid ${key} in ${context}`);
        }
        if (check(value, type)) {
          continue;
        }
        throw new BadRequest(`invalid ${key} in ${context}`);
      }
    } catch (error) {
      return next(error);
    }
    next();
  };
}

function body(map) {
  return required('body', map);
}

function queries(map) {
  return required('query', map);
}

function headers(map) {
  return required('header', map);
}

function params(map) {
  return required('params', map);
}

function env(...envs) {
  return (req, res, next) => {
    try {
      if (envs.every(e => e !== process.env.NODE_ENV)) {
        throw new Forbidden();
      }
    } catch (err) {
      return next(err);
    }
    next();
  };
}

function auth(expander) {
  return async (req, res, next) => {
    try {
      if (!process.env.SKIP_AUTH) {
        req.$user = await expander.expand(req);
        if (!req.$user) {
          throw new Unauthorized();
        }
      }
    } catch (err) {
      return next(err);
    }
    next();
  };
}

function pagination(options) {
  const { indexName = 'i', sizeName = 's', maxSize = 200, minSize = 5, defaultSize = 20 } =
    options || {};

  return (req, res, next) => {
    try {
      let page, size;
      if (req.query) {
        const index = req.query[indexName] || 0;
        const limit = req.query[sizeName] || defaultSize;
        if (
          Number.isNaN(index) ||
          index < 0 ||
          Number.isNaN(limit) ||
          limit < minSize ||
          limit > maxSize
        ) {
          throw new BadRequest('Invalid pagination arguments');
        }
        page = Number(index);
        size = Number(limit);
      } else {
        page = 0;
        size = defaultSize;
      }
      req.$options = Object.assign({}, req.$options, {
        offset: size * page,
        limit: size,
        index: page
      });
    } catch (err) {
      return next(err);
    }
    next();
  };
}

function filter(options) {
  const { filterName = 'w' } = options || {};

  return (req, res, next) => {
    try {
      if (req.query && req.query[filterName]) {
        let where;
        if (typeof req.query[filterName] === 'object') {
          where = req.query[filterName];
        } else if (typeof req.query[filterName] === 'string') {
          try {
            where = JSON.parse(req.query[filterName]);
          } catch (err) {
            throw new BadRequest('Invalid filter expression');
          }
        } else {
          throw new BadRequest('Invalid filter expression');
        }
        req.$options = Object.assign({}, req.$options, {
          where
        });
      }
    } catch (err) {
      return next(err);
    }
    next();
  };
}

function sort(options) {
  const { sortName = 'o' } = options || {};

  return (req, res, next) => {
    try {
      if (req.query && req.query[sortName]) {
        let order;
        if (typeof req.query[sortName] === 'object') {
          order = req.query[sortName];
        } else if (typeof req.query[sortName] === 'string') {
          try {
            order = JSON.parse(req.query[sortName]);
          } catch (err) {
            throw new BadRequest('Invalid sort expression');
          }
        } else {
          throw new BadRequest('Invalid sort expression');
        }
        req.$options = Object.assign({}, req.$options, {
          order
        });
      }
    } catch (err) {
      return next(err);
    }
    next();
  };
}

function projection(options) {
  const { projectionName = 'p' } = options || {};

  return (req, res, next) => {
    try {
      if (req.query && req.query[projectionName]) {
        let select;
        if (Array.isArray(req.query[projectionName])) {
          select = req.query[projectionName];
        } else if (typeof req.query[projectionName] === 'string') {
          try {
            select = JSON.parse(req.query[projectionName]);
          } catch (error) {
            throw new BadRequest('Invalid projection expression');
          }
        } else {
          throw new BadRequest('Invalid projection expression');
        }
        req.$options = Object.assign(req.$options || {}, { select });
      }
    } catch (err) {
      return next(err);
    }
    next();
  };
}

function access(options) {
  const { namespace, key, secret } = options;
  const crypto = require('crypto');

  return (req, res, next) => {
    try {
      if (!process.env.SKIP_AUTH) {
        const header = req.header('authorization');
        if (!header || !header.startsWith(namespace + key + ':')) {
          throw new Unauthorized();
        }
        const md5 = crypto
          .createHash('md5')
          .update(JSON.stringify(req.body || {}))
          .digest('hex');
        const sha1 = crypto
          .createHmac('sha1', secret)
          .update(req.method + md5 + req.header('content-type') + req.originalUrl)
          .digest('base64');
        const calc = namespace + key + ':' + sha1;
        if (calc !== header) {
          throw new Unauthorized();
        }
      }
    } catch (err) {
      return next(err);
    }
    next();
  };
}

module.exports = {
  body,
  queries,
  headers,
  params,
  env,
  auth,
  pagination,
  filter,
  sort,
  projection,
  access
};

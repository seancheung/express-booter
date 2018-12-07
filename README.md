# express-booter

[![Master Build][travis-master]][travis-url]

Express routes booter and middlewares

[travis-master]: https://img.shields.io/travis/seancheung/express-booter/master.svg?label=master
[travis-url]: https://travis-ci.org/seancheung/express-booter

## Install

```bash
npm i express-booter
```

## Usage

### Boot routes

```javascript
const { boot } = require('express-booter');
boot('path/to/routes', router, options);
```

Boot options

```javascript
const options = {
  filter: f => /\.js$/.test(f),
  cb: route => console.log(route.method, route.url),
  safe: false
};
```

Route definition

```javascript
module.exports = {
  name: '/users',
  // top level middlewares
  middlewares: [
    (req, res, next) => {
      // TODO:
    }
  ],

  list: {
    name: '/',
    method: 'get',
    // handler level middlewares
    middlewares: [
      (req, res, next) => {
        // TODO:
      }
    ],
    handler(req, res, next) {
      // TODO:
    }
  },

  get: {
    name: '/:id',
    method: 'get',
    handler(req, res, next) {
      // TODO:
    }
  },

  create: {
    name: '/',
    method: 'post',
    handler(req, res, next) {
      // TODO:
    }
  }
};
```

### Guards

```javascript
const { guards } = require('express-booter');
// Check required field exists in request body
router.use(guards.body(['name', 'type']));
router.use(guards.body(map));
// Check required field exists in request query strings
router.use(guards.queries(map));
// Check required field exists in request headers
router.use(guards.headers(map));
// Success if current running NODE_ENV maches any
router.use(guards.env('development', 'test'));
// Extract user entity from request
router.use(guards.auth(expander));
// Parse pagination options from query string
router.use(guards.pagination(options));
// Parse filter options from query string
router.use(guards.filter(options));
// Parse sort options from query string
router.use(guards.sort(options));
// Parse projection options from query string
router.use(guards.projection(options));
// Check authorization header
router.use(guards.access(options));
```

### Errors

```javascript
const { errors } = require('express-booter');
// 400
throw new errors.BadRequest(message);
// 401
throw new errors.Unauthorized(message);
// 403
throw new errors.Forbidden(message);
// 404
throw new errors.NotFound(message);
// 409
throw new errors.Conflict(message);
// 410
throw new errors.Expired(message);
// 500
throw new errors.Internal(message);
// 501
throw new errors.NotImplemented(message);
```

## Test

```bash
npm test
```

## License

See [License](https://github.com/seancheung/express-booter/blob/master/LICENSE)

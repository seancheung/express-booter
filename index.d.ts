/// <reference types="node" />
/// <reference types="express" />
import { Router, RequestHandler, Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      $options?: QueryOptions
      $user?: any
    }
    interface QueryOptions {
      offset?: number
      limit?: number
      index?: number
      where?: any
      order?: any
      select?: any
    }
  }
}

declare namespace booter {
  function boot(dir: string, router: Router, options?: boot.Options): Router
  namespace boot {
    interface Options {
      /**
       * Filter files
       */
      filter?: (path: string) => boolean
      /**
       * Mounted callback
       */
      cb?: (route: { method: string; url: string }) => void
      /**
       * Catch handler errors
       * @default true
       */
      safe?: boolean
    }
  }
  namespace errors {
    class HttpError {
      constructor(status: number, message?: string)
    }
    /**
     * HTTP 400
     */
    class BadRequest extends HttpError {
      constructor(message?: string)
    }
    /**
     * HTTP 401
     */
    class Unauthorized extends HttpError {
      constructor(message?: string)
    }
    /**
     * HTTP 403
     */
    class Forbidden extends HttpError {
      constructor(message?: string)
    }
    /**
     * HTTP 404
     */
    class NotFound extends HttpError {
      constructor(message?: string)
    }
    /**
     * HTTP 409
     */
    class Conflict extends HttpError {
      constructor(message?: string)
    }
    /**
     * HTTP 410
     */
    class Expired extends HttpError {
      constructor(message?: string)
    }
    /**
     * HTTP 500
     */
    class Internal extends HttpError {
      constructor(message?: string)
    }
    /**
     * HTTP 501
     */
    class NotImplemented extends HttpError {
      constructor(message?: string)
    }
  }
  /**
   * Middlewares
   */
  namespace guards {
    interface Expander {
      /**
       * Extract user object from request
       *
       * @param req Request
       */
      expand(req: Request): any
    }
    interface Pagination {
      /**
       * Page index query string name
       * @default 'i'
       */
      indexName?: string
      /**
       * Page size query string name
       * @default 's'
       */
      sizeName?: string
      /**
       * Page max size
       * @default 200
       */
      maxSize?: number
      /**
       * Page min size
       * @default 5
       */
      minSize?: number
      /**
       * Page default size
       * @default 20
       */
      defaultSize?: number
    }
    interface Filter {
      /**
       * Filter query string name
       * @default 'w'
       */
      filterName?: string
    }
    interface Sort {
      /**
       * Sort query string name
       * @default 'o'
       */
      sortName?: string
    }
    interface Projection {
      /**
       * Projection query string name
       * @default 'p'
       */
      projectionName?: string
    }
    interface Access {
      /**
       * Signing namespace
       */
      namespace: string
      /**
       * Signing key
       */
      key: string
      /**
       * Signing secret
       */
      secret: string
    }
    /**
     * Check required field exists in request body
     *
     * @param map Required fields map with key being the field key and value being the hint value
     * @throws {errors.BadRequest} xxx missing in body
     */
    function body(map: Map<string, string>): RequestHandler
    /**
     * Check required field exists in request query strings
     *
     * @param map Required fields map with key being the field key and value being the hint value
     * @throws {errors.BadRequest} xxx missing in query
     */
    function queries(map: Map<string, string>): RequestHandler
    /**
     * Check required field exists in request headers
     *
     * @param map Required fields map with key being the field key and value being the hint value
     * @throws {errors.BadRequest} xxx missing in header
     */
    function headers(map: Map<string, string>): RequestHandler
    /**
     * Success if current running NODE_ENV maches any
     *
     * @param envs Envs to match against
     * @throws {errors.Forbidden}
     */
    function env(...envs: string[]): RequestHandler
    /**
     * Extract user entity from request
     *
     * @param expander Token expander
     * @throws {errors.Unauthorized}
     */
    function auth(expander: guards.Expander): RequestHandler
    /**
     * Parse pagination options from query string
     *
     * @param options Pagination options
     * @throws {errors.BadRequest} Invalid pagination arguments
     */
    function pagination(options?: guards.Pagination): RequestHandler
    /**
     * Parse filter options from query string
     *
     * @param options Filter options
     * @throws {errors.BadRequest} Invalid filter expression
     */
    function filter(options?: guards.Filter): RequestHandler
    /**
     * Parse sort options from query string
     *
     * @param options Sort options
     * @throws {errors.BadRequest} Invalid sort expression
     */
    function sort(options?: guards.Sort): RequestHandler
    /**
     * Parse projection options from query string
     *
     * @param options Projection options
     * @throws {errors.BadRequest} Invalid projection expression
     */
    function projection(options?: guards.Projection): RequestHandler
    /**
     * Check authorization header.
     * The underlying hash checking strategy is:
     * @example namespace + key + ':' + sha1(secret, method + md5(json(body || {}), 'hex') + headers['Content-Type'] + url(pathname + search), 'base64')
     *
     * @param options Access options
     * @throws {errors.Unauthorized}
     */
    function access(options: guards.Access): RequestHandler
  }
}

export = booter

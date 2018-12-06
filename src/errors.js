class HttpError extends Error {

  /**
   * Creates an instance of HttpError
   *
   * @param {number} status
   * @param {string} [message]
   */
  constructor(status, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
  }

}

class BadRequest extends HttpError {

  /**
   * Creates an instance of BadRequest
   *
   * @param {string} [message]
   * @memberof BadRequest
   */
  constructor(message) {
    super(400, message || 'Bad Request');
  }

}

class Unauthorized extends HttpError {

  /**
   * Creates an instance of Unauthorized
   *
   * @param {string} [message]
   * @memberof Unauthorized
   */
  constructor(message) {
    super(401, message || 'Unauthorized');
  }

}

class Forbidden extends HttpError {

  /**
   * Creates an instance of Forbidden
   *
   * @param {string} [message]
   * @memberof Forbidden
   */
  constructor(message) {
    super(403, message || 'Forbidden');
  }

}

class NotFound extends HttpError {

  /**
   * Creates an instance of NotFound
   *
   * @param {string} [message]
   * @memberof NotFound
   */
  constructor(message) {
    super(404, message || 'Not Found');
  }

}

class Conflict extends HttpError {

  /**
   * Creates an instance of Conflict
   *
   * @param {string} [message]
   * @memberof Conflict
   */
  constructor(message) {
    super(409, message || 'Conflict');
  }

}

class Expired extends HttpError {

  /**
   * Creates an instance of Expired
   *
   * @param {string} [message]
   * @memberof Expired
   */
  constructor(message) {
    super(410, message || 'Expired');
  }

}

class Internal extends HttpError {

  /**
   * Creates an instance of Internal
   *
   * @param {string} [message]
   */
  constructor(message) {
    super(500, message || 'Internal Error');
  }

}

class NotImplemented extends HttpError {

  /**
   * Creates an instance of NotImplemented
   *
   * @param {string} [message]
   * @memberof NotImplemented
   */
  constructor(message) {
    super(501, message || 'Not Implemented');
  }

}

module.exports = {
  HttpError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  Expired,
  Internal,
  NotImplemented
};

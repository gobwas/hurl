var HTTPError = require("../error").HTTPError,
    _ = require("lodash"),
    TimeoutHTTPError;

/**
 * TimeoutHTTPError
 *
 * @class TimeoutHTTPError
 * @extends HTTPError
 */
TimeoutHTTPError = HTTPError.extend(
    /**
     * @lends TimeoutError.prototype
     */
    {

    }
);

exports.TimeoutHTTPError = TimeoutHTTPError;

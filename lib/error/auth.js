var HTTPError = require("../error").HTTPError,
    _      = require("lodash"),
    AuthHTTPError;

/**
 * AuthHTTPError
 *
 * @class AuthHTTPError
 * @extends HTTPError
 */
AuthHTTPError = HTTPError.extend(
    /**
     * @lends AuthHTTPError.prototype
     */
    {

    }
);

exports.AuthHTTPError = AuthHTTPError;

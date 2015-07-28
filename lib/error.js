var inherits = require("inherits-js");
var HTTPError;

/**
 * @constructor
 * @extends Error
 */
HTTPError = inherits(Error,
    /**
     * @lends HTTPError.prototype
     */
    {
        constructor: function() {
            var error;

            error = Error.apply(null, arguments);

            // save native error
            this._error = error;

            this.message = error.message;
            this.stack   = error.stack
                ? error.stack.replace(new RegExp("^Error"), this.name)
                : null;
        }
    },

    {
        extend: function(p, s) {
            return inherits(this, p, s);
        }
    }
);

exports.HTTPError = HTTPError;

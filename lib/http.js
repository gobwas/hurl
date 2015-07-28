var _            = require("lodash"),
    inherits     = require("inherits-js"),
    assert       = require("assert"),
    EventEmitter = require("events").EventEmitter,
    HTTP;

/**
 * HTTP
 *
 * @class HTTP
 * @extends EventEmitter
 * @abstract
 *
 * @param {Object} [options]
 */
HTTP = inherits( EventEmitter,
    /**
     * @lends HTTP.prototype
     */
    {
        constructor: function(options) {
            var self;

            EventEmitter.call(this);
            this.options = _.extend({}, this.constructor.DEFAULTS, options);

            // default logger is evented
            this.logger = _.reduce(
                [
                    "debug",
                    "info",
                    "notice",
                    "warning",
                    "error",
                    "critical",
                    "alert",
                    "emergency"
                ],
                function(memo, level) {
                    memo[level] = function() {
                        self.emit.apply(self, ["log:" + level].concat([].slice.call(arguments)));
                    }
                    return memo;
                },
                {}
            );
        },

        injectUUID: function(uuid) {
            assert(_.isEmpty(this.uuid), "UUID is already set");
            assert(typeof uuid == "function", "UUID is expected to be a function");
            this.uuid = uuid;
        },

        /**
         * @abstract
         *
         * @param {string} url
         * @param {Object} [options]
         * @param {Object} [options.query]
         * @param {Object} [options.headers]
         * @param {Object} [options.auth]
         * @param {Object} [options.agent]
         * @param {Object} [options.data]
         * @param {Object} [options.timeout]
         * @param {Object} [options.method]
         *
         * @returns RSVP.Promise
         */
        request: function(url, options) {
            throw new Error("Method must be implemented");
        }
    },

    /**
     * @lends HTTP
     */
    {
        extend: function(prots, statics) {
            return inherits(this, prots, statics);
        },

        DEFAULTS: {}
    }
);

exports.HTTP = HTTP;

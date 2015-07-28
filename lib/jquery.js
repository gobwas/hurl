var HTTP      = require("./http"),
    _         = require("lodash"),
    $         = require("jquery"),
    HTTPError = require("./error"),
    RSVP      = require("rsvp"),
    JQueryHTTP;

/**
 * JQueryHTTP
 *
 * @class JQueryHTTP
 * @extends HTTP
 */
JQueryHTTP = HTTP.extend(
    /**
     * @lends JQueryHTTP.prototype
     */
    {
        /**
         * @param {string} url
         * @param {Object} [options]
         * @param {Object} [options.query]
         * @param {Object} [options.headers]
         * @param {Object} [options.auth]
         * @param {Object} [options.agent]
         * @param {Object} [options.data]
         * @param {Object} [options.timeout]
         * @param {Object} [options.method]
         */
        request: function(url, options) {
            var self = this,
                start, commonLog;

            commonLog = {
                href: url,
                uuid: this.uuid.generate("req.out")
            };

            options = _.defaults(options || {}, {
                method: "GET"
            });

            start = this.getTime();

            return new RSVP.Promise(function(resolve, reject) {
                var method, query, data, timeout,
                    config, headers, error;

                method = options.method;

                data = options.data;

                // @see http://www.w3.org/TR/XMLHttpRequest/ #4.6.6
                if (_.contains(["GET", "HEAD"], method) && data) {
                    error = new HTTPError("Could not add body to the GET|HEAD requests");

                    self.logger.fatal("HTTP request could not be prepared", {
                        context: options,
                        error:     error,
                        namespace: "http",
                        tags:      "error"
                    });

                    throw error;
                }

                if (!_.isEmpty(query = options.query)) {
                    url = url + (url.indexOf("?") !== -1 ? "&" : "?") + $.param(query)
                }

                config = {
                    type:     method,
                    url:      url,
                    dataType: "text"
                };

                data && (config.data = data);

                if (headers = options.headers) {
                    config.beforeSend = function(jqXHR) {
                        _.forEach(headers, function(value, key) {
                            jqXHR.setRequestHeader(key, value);
                        });
                    }
                }

                if (timeout = options.timeout) {
                    config.timeout = timeout;
                }

                self.logger.debug("Sending HTTP request", {
                    context:   _.extend({}, options, commonLog),
                    namespace: "http",
                    tags:      "http,request"
                });

                $
                    .ajax(config)
                    .then(function(body, textStatus, jqXHR) {
                        var length;

                        length = self.byteLength(body) / 1024;

                        self.logger.debug("Received HTTP response", { namespace: "http", tags: "http,response", context: _.extend({
                            duration: self.getTime() - start,
                            body:     length < 10 ? body : "...",
                            length:   Math.ceil(length) + "KB",
                            status:   jqXHR.status,
                            headers:  self.extractHeaders(jqXHR.getAllResponseHeaders())
                        }, commonLog)});

                        resolve({
                            body:       body,
                            statusCode: jqXHR.status
                        });
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        var error;

                        error = new HTTPError(errorThrown);
                        error.body = jqXHR.responseText;
                        error.xhr  = jqXHR;

                        self.logger.error("HTTP request error", { namespace: "http", tags: "http,error", error: errorThrown, context: _.extend({
                            duration: self.getTime() - start,
                            status: jqXHR.status,
                            body:   jqXHR.responseText
                        }, commonLog)});

                        reject(error);
                    });
            });
        },

        /**
         * @private
         * @returns {number}
         */
        getTime: function() {
            return (new Date()).getTime();
        },

        /**
         * @private
         * @param str
         * @returns {number}
         */
        byteLength: function(str) {
            // returns the byte length of an utf8 string
            var s = str.length;
            for (var i=str.length-1; i>=0; i--) {
                var code = str.charCodeAt(i);
                if (code > 0x7f && code <= 0x7ff) s++;
                else if (code > 0x7ff && code <= 0xffff) s+=2;
                if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
            }
            return s;
        },

        /**
         * @private
         * @param headersString
         */
        extractHeaders: (function() {
            var pattern;

            pattern = /([a-z\-]+):\s*([^\n]+)\n?/gi;

            return function(headersString) {
                var headers, match;

                headers = {};

                while (match = pattern.exec(headersString)) {
                    headers[match[1]] = match[2];
                }

                return headers;
            }
        })()
    }
);

module.exports = JQueryHTTP;

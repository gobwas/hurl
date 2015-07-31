var XhrHttp   = require("./xhr").XhrHttp,
    _         = require("./utils"),
    $         = require("jquery"),
    HttpError = require("./error").HttpError,
    JQueryHttp;

/**
 * JQueryHttp
 *
 * @class JQueryHttp
 * @extends Http
 */
JQueryHttp = XhrHttp.extend(
    /**
     * @lends JQueryHttp.prototype
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
                uuid: this.genUUID("req.out")
            };

            options = _.defaults(options || {}, {
                method: "GET"
            });

            start = this.getTime();

            return new Promise(function(resolve, reject) {
                var method, query, data, timeout,
                    config, headers, error;

                method = options.method;

                data = options.data;

                // @see http://www.w3.org/TR/XMLHttpRequest/ #4.6.6
                if (_.contains(["GET", "HEAD"], method) && data) {
                    error = new HttpError("Could not add body to the GET|HEAD requests");

                    self.logger.fatal("Http request could not be prepared", {
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

                self.logger.debug("Sending http request", {
                    context:   _.extend({}, options, commonLog),
                    namespace: "http",
                    tags:      "http,request"
                });

                $
                    .ajax(config)
                    .then(function(body, textStatus, jqXHR) {
                        var length;

                        length = self.byteLength(body) / 1024;

                        self.logger.debug("Received http response", { namespace: "http", tags: "http,response", context: _.extend({
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

                        error = new HttpError(errorThrown);
                        error.body = jqXHR.responseText;
                        error.xhr  = jqXHR;

                        self.logger.error("http request error", { namespace: "http", tags: "http,error", error: errorThrown, context: _.extend({
                            duration: self.getTime() - start,
                            status: jqXHR.status,
                            body:   jqXHR.responseText
                        }, commonLog)});

                        reject(error);
                    });
            });
        }
    }
);

exports.JQueryHttp = JQueryHttp;

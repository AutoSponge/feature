(function (global, pubsub) {
    "use strict";
    function noop() {}
    function unsub(topic, fn) {
        return function () {
            pubsub.remove(topic, fn);
            return this;
        };
    }
    function apply(reciever, args) {
        return function (fn) {
            return fn.apply(reciever, args);
        };
    }
    function pushProp(prop) {
        return function pushVal(val) {
            if (val) {
                this[prop].push(val);
            }
            return this;
        };
    }
    /**
     * describe an application feature
     * @param description
     * @returns {Feature}
     * @constructor
     */
    function Feature(description) {
        if (Feature.cache[description]) {
            return Feature.cache[description];
        }
        if (!(this instanceof Feature)) {
            return new Feature(description);
        }
        this.description = description;
        this.start = [];
        this.stop = [];
        this.action = [];
        this.register();
    }
    /**
     * aliases the method
     * @param prop
     * @param rename
     * @static
     * @returns {function}
     */
    Feature.alias = function (prop, rename) {
        this.prototype[rename] = this.prototype[prop];
        return this;
    };
    /**
     * cache of registered features
     * @type {{}}
     */
    Feature.cache = {};
    Feature.prototype = {
        /**
         * @param fn [{function}]
         * @returns {Object<Feature>}
         */
        given: pushProp("start"),
        /**
         * @param fn [{function}]
         * @returns {Object<Feature>}
         */
        unless: pushProp("stop"),
        /**
         * @param fn [{function}]
         * @returns {Object<Feature>}
         */
        then: pushProp("action"),
        /**
         * the topic that will disable the feature's trigger
         * @param topic {string}
         * @returns {Object<Feature>}
         */
        until: function (topic) {
            pubsub.subscribe(topic, this.disable);
            return this;
        },
        /**
         * the topic that will trigger the feature
         * @param topic {string}
         * @returns {Object<Feature>}
         */
        when: function (topic) {
            this.disable = unsub(topic, pubsub.subscribe(topic, this.trigger, null, this).id);
            return this;
        },
        /**
         * @returns {Object<Feature>}
         */
        trigger: function () {
            var fn = apply(this, arguments);
            this.start.every(fn) && !this.stop.some(fn) && this.action.forEach(fn);
            return this;
        },
        /**
         * @returns {Object<Feature>}
         */
        disable: function () {
            this.trigger = noop;
            return this;
        },
        /**+
         * register an instance to the cache
         */
        register: function () {
            Feature.cache[this.description] = this;
        }
    };
    /**
     * @borrows given as and
     */
    Feature.alias("given", "and")
    /**
     * @borrows unless as or
     */
        .alias("unless", "or");

    global.Feature = {
        /**
         * @param description {string}
         * @returns {Object<Feature>}
         */
        create: Feature,
        /**
         * @param description
         * @returns {Object<Feature>}
         */
        get: function (description) {
            return Feature.cache && Feature.cache[description];
        },
        /**
         * @param topic {string}
         * @returns {Feature}
         */
        publish:  function () {
            pubsub.publish.apply(pubsub, arguments);
            return this;
        }
    };
}(this, Mediator()));

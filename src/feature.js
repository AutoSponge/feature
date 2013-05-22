(function (global, pubsub) {
    "use strict";
    function noop() {}
    function unsub(topic, fn) {  
        return function () {
            return pubsub.remove(topic, fn);
        };
    }
    function apply(reciever, args) {
        return function (fn) {
            return fn.apply(reciever, args);
        };
    }
    function pushProp(prop) {
        return function pushVal(val) {
            this[prop].push(val);
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
        this.disable = noop;
        this.register();
    }
    Feature.alias = function (prop, rename) {
        this.prototype[rename] = this.prototype[prop];
        return this;
    };
    Feature.cache = {};
    Feature.prototype = {
        given: pushProp("start"),
        unless: pushProp("stop"),
        then: pushProp("action"),
        until: function (topic) {
            pubsub.subscribe(topic, this.disable);
            return this;
        },
        when: function (topic) {
            this.disable = unsub(topic, pubsub.subscribe(topic, this.fire, null, this).id);
            return this;
        },
        fire: function () {
            var fn = apply(this, arguments);
            return this.start.every(fn) && !this.stop.some(fn) && this.action.forEach(fn);
        },
        register: function () {
            Feature.cache[this.description] = this;
        }
    };
    Feature.alias("given", "and")
        .alias("unless", "or");

    global.Feature = {
        create: Feature,
        get: function (description) {
            return Feature.cache && Feature.cache[description];
        },
        publish:  function () {
            pubsub.publish.apply(pubsub, arguments);
            return this;
        }
    };
}(this, Mediator()));

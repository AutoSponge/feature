(function (global, pubsub) {
    "use strict";
    function noop() {}
    function unsub(topic, fn) {  
        return function () {
            return pubsub.remove(topic, fn);
        };
    }
    function publish() {
        pubsub.publish.apply(pubsub, arguments);
        return this;
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
    function get(description) {
        return Feature.cache[description];
    }
    function Feature(description) {
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
    Feature.mung = function (prop, rename) {
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
    Feature.mung("given", "and")
        .mung("unless", "or");

    global.Feature = {
        create: Feature,
        publish: publish
    };
}(this, Mediator()));

Feature.create("run feature1 under the right conditions")
    .given(function (data) {return typeof data === "number";})
        .and(function (data) {return !!data;})
    .when("feature1/start")
    .then(function(a, b){
        console.log("pass", a, b);
    })
    .unless(function (data) {return data === 1})
        .or(function (data) {return data%2 === 0})
    .until("feature1/stop");
 
Feature.publish("feature1/start", 3, 4)     //pass 3
    .publish("feature1/start", 1)        //nothing
    .publish("feature1/start", 2)        //nothing
    .publish("feature1/stop")
    .publish("feature1/start", 3)

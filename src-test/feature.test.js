module("Feature");

function _true() {return true;};
function _false() {return false;};
function _undefined() {};
function _null () {return null;}
function _function() {return function () {};};
function _object() {return {};};
function _empty() {return "";};
function _zero() {return 0;};
function _number() {return 1;};
function _string() {return "string";};

test("Feature is an object", function () {
    ok(typeof Feature === "object");
});

test("Feature has the correct API", function () {
    expect(2);
    ok(typeof Feature.create === "function");
    ok(typeof Feature.publish === "function");
});

test("Feature.create returns a Feature instance object", function () {
    expect(2);
    var feature = Feature.create("Feature is an object");
    ok(typeof feature === "object");
    ok(feature instanceof Feature.create);
});

test("Feature.create returns a Feature instance by description", function () {
    var feature = Feature.create("Features register description");
    ok(Feature.create("Features register description") === feature);
});

test("Feature instances have the correct API", function () {
    expect(9);
    var feature = Feature.create("Feature API");
    ok(typeof feature.given === "function");
    ok(typeof feature.and === "function");
    ok(typeof feature.when === "function");
    ok(typeof feature.then === "function");
    ok(typeof feature.unless === "function");
    ok(typeof feature.or === "function");
    ok(typeof feature.until === "function");
    ok(typeof feature.trigger === "function");
    ok(typeof feature.disable === "function");
});

test("Feature instances have a fluent interface", function () {
    expect(10);
    var isFluent = false;
    var feature = Feature.create("Feature is fluent");
    ok(feature.given(_true) === feature);
    ok(feature.and(_true) === feature);
    ok(feature.when("fluent/trigger") === feature);
    ok(feature.then(function () {isFluent = true;}) === feature);
    ok(feature.unless(_false) === feature);
    ok(feature.or(_false) === feature);
    ok(feature.until("fluent/disable"));
    ok(feature.trigger() === feature);
    ok(feature.disable() === feature);
    ok(isFluent === true);
});

test("Features can trigger by topic", function () {
    var triggered = false;
    Feature.create("Feature trigger by topic")
        .given(_true)
        .when("topic/trigger")
        .then(function () {triggered = true;})

    Feature.publish("topic/trigger");
    ok(triggered === true);
});

test("Features can trigger by method", function () {
    var triggered = false;
    Feature.create("Feature trigger by topic")
        .given(_true)
        .then(function () {triggered = true;})
        .trigger();
    ok(triggered === true);
});

test("Features do not execute a _then_ function unless all conditions are met", function () {
    expect(3);
    var triggered = false;
    Feature.create("given stops on non-true")
        .given(_undefined)
        .then(function () {triggered = true;})
        .trigger();
    ok(triggered === false);

    Feature.create("unless stops on true")
        .then(function () {triggered = true;})
        .unless(_true)
        .trigger();
    ok(triggered === false);

    Feature.create("given ignores truthy and unless ignores falsey")
        .given(_object)
        .and(_string)
        .and(_function)
        .and(_number)
        .and(_true)
        .then(function () {triggered = true;})
        .unless(_zero)
        .or(_empty)
        .or(_null)
        .or(_undefined)
        .or(_false)
        .trigger();
    ok(triggered === true);
});

test("Features can disable from _unless_ topics", function () {
    var triggered = false;
    Feature.create("given stops on non-true")
        .given(_true)
        .when("trigger")
        .then(function () {triggered = true;})
        .unless("trigger/disable");

    Feature.publish("trigger/disable");
    Feature.publish("trigger");
    ok(triggered === false);
});

test("Features can disable", function () {
    expect(2);
    var triggered = false;
    Feature.create("given stops on non-true")
        .given(_true)
        .when("trigger")
        .then(function () {triggered = true;})
        .disable();

    Feature.publish("trigger");
    ok(triggered === false);

    Feature.create("given stops on non-true")
        .then(function () {triggered = true;})
        .disable()
        .trigger();

    ok(triggered === false);
});
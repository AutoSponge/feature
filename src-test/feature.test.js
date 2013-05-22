module("Feature");

test("Feature is an object", function () {
    ok(typeof Feature === "object");
});

test("Feature has the correct API", function () {
    ok(typeof Feature.create === "function");
    ok(typeof Feature.publish === "function");
});

test("Feature.create returns a Feature instance object", function () {
    var test = Feature.create("test");
    ok(typeof test === "object");
    ok(test instanceof Feature.create);
});

test("Feature.create returns a Feature instance by description", function () {
    var test = Feature.create("test");
    ok(Feature.create("test") === test);
});

test("Feature instances have the correct API", function () {
    var test = Feature.create("test");
    ok(typeof test.given === "function");
    ok(typeof test.unless === "function");
    ok(typeof test.when === "function");
    ok(typeof test.then === "function");
    ok(typeof test.and === "function");
    ok(typeof test.or === "function");
    ok(typeof test.until === "function");
});



/*
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
*/
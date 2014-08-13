var _ = require('lodash');
var fs = require('fs');
var getData = require('./dataService');

var Q = require("q");

var deferred;

module.exports = function() {

    deferred = Q.defer();

    var cacheFile = "./cache.json";

    fs.exists(cacheFile, function (exists) {

        if (exists) {
            fs.readFile(filename, { encoding : "utf-8"}, function(err, contents) {
                deferred.resolve(JSON.parse(contents));
            })
        } else {
            getData().then(function (content) {

                fs.writeFile(filename, content, function (err) {
                    if (err) throw err;
                    deferred.resolve(content);
                });

                fs.writeFile(filename, content);
            }, function (err) {
                deferred.reject(err);
            });
        }
    });

    return deferred.promise;
}
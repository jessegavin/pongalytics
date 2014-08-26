var _ = require('lodash');
var fs = require('fs');
var getData = require('./dataService');

var Q = require("q");

var deferred;

module.exports = function(forceRefresh) {

    deferred = Q.defer();

    var cacheFile = "./cache.json";

    function retrieveAndStoreData() {
      getData().then(function (content) {

        fs.writeFileSync(cacheFile, JSON.stringify(content));

        deferred.resolve(content);

      }, function (err) {
        deferred.reject(err);
      });
    }


    if (forceRefresh) {
      retrieveAndStoreData();
    } else {
      var cacheFileExists = fs.existsSync(cacheFile);
      if (cacheFileExists) {
        var fileContents = fs.readFileSync(cacheFile, { encoding : "utf-8"});
        deferred.resolve(JSON.parse(fileContents));
      } else {
        retrieveAndStoreData();
      }
    }

    return deferred.promise;
}
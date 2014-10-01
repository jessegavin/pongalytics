var _ = require('lodash');
var bluebird = require('bluebird');
var getScores = require('./getScores');

var cache = {};

module.exports = function(bypassCache) {

  if (!_.isEmpty(cache) && !bypassCache) {
    return new bluebird(function (resolve) {
      resolve(cache);
    })
  }

  return getScores()
    .then(function(data) {

      _.assign(cache, {
        players: _.chain(data.players)
          .map(function(p, name) {
            return _.assign(p, { name: name });
          })
          .sortBy(function(p) {
            return 0-p.rank;
          })
          .valueOf(),
        timestamp: new Date()
      });

      return cache;
    });
}


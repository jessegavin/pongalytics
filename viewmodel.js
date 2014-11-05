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
            return _.assign(p, {
              name: name
            });
          })
          .sortBy(function(p) {
            return 0-p.rank;
          })
          .valueOf(),
        timestamp: new Date(),
        movers: _.chain(data.movers)
          .map(function(m) {
            m.style = (m.eloChange === 0) ? '' : m.eloChange > 0 ? "color:green" : "color:red";
            m.eloChangeDisplay = m.eloChange > 0 ? '+' + m.eloChange : m.eloChange;
            return m;
          })
          .sortBy(function(p) {
            return Math.abs(0-p.eloChange);
          })
          .reverse()
          .value()
      });

      return cache;
    });
}

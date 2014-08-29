var _ = require("lodash");
var gravatarize = require("./gravatar");
var spreadsheet = require('./spreadsheet');

function processSpreadsheet(result) {

  var rows = result.rows;

  var numberOfHeaderRows = 1;

  var columns = {
    "name": "1",
    "elo": "2",
    "gravatar": "3"
  };

  var players = {};

  _.chain(rows)
    .values()
    .rest(numberOfHeaderRows)
    .map(function transformRow(row) {
      return _.mapValues(columns, function (index) {
        return row[index];
      });
    })
    .forEach(function(p) {
      players[p.name] = {
        rank: p.elo,
        gravatar: gravatarize(p.gravatar),
        opponents : [],
        games : []
      }
    })
    .valueOf();

  return players;
}

module.exports = function () {
  return spreadsheet("Players").then(processSpreadsheet);
}
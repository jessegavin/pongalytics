var bluebird = require("bluebird");
var getPlayers = require("./getPlayers");
var getRows = require("./transformSpreadSheetRows");
var _ = require("lodash");
var elo = require('elo-rank')();
var moment = require("moment");
var spreadsheet = require('./spreadsheet');

function processSpreadsheet(players, scoreData) {

  var info = scoreData.info;
  var numberOfHeaderRows = 2;

  var columns = {
    "game_date": "1",
    "player1_name": "2",
    "player1_score": "3",
    "player1_aces": "4",
    "player2_name": "5",
    "player2_score": "6",
    "player2_aces": "7"
  };

  var gameData = getRows(columns, scoreData.rows, numberOfHeaderRows);

  function getNumber(value) {
    if (_.isUndefined(value)) {
      return 0;
    }
    var parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  function transformGame(game, playerA, playerB) {
    return {
      gameNumber: game.game_number,
      gameDate: moment(game.game_date, "MM-DD-YYYY"),
      score: getNumber(game[playerA + "_score"]),
      aces: getNumber(game[playerA + "_aces"]),
      opponentName: game[playerB + "_name"],
      opponentScore: getNumber(game[playerB + "_score"]),
      opponentAces: getNumber(game[playerB + "_aces"]),
      winningSide: game.winning_side
    };
  }

  function buildStats(games) {

      var career = {
        total: 0,
        aces: 0,
        wins: 0,
        losses: 0,
        points: 0,
        acesAllowed: 0,
        pointsAllowed: 0,
        avgPointsPerGame: 0,
        pointDifferential: 0
      };

      var winStreak = 0;
      var lossStreak = 0;
      var winStreaks = [];
      var lossStreaks = [];
      var overtimeWins = 0;
      var overtimeLosses = 0;

      var gameStats = _.map(games, function(game, index) {
          career.total++;
          career.aces += game.aces;
          career.wins += game.win ? 1 : 0;
          career.losses += game.win ? 0 : 1;
          career.points += game.score;
          career.acesAllowed += game.opponentAces;
          career.pointsAllowed += game.opponentScore;
          career.pointDifferential += game.score - game.opponentScore;

          var _isOvertime = Math.max(game.opponentScore, game.score) > 11;

          overtimeWins += game.win && _isOvertime ? 1 : 0;
          overtimeLosses += game.win && _isOvertime ? 0 : 1;

          if (index > 0 && games[index-1].win && game.win) {
              winStreak++;
          } else {
              winStreaks.push(winStreak);
              winStreak = 0;
          }

          if (index > 0 && !games[index-1].win && !game.win) {
              lossStreak++;
          } else {
              lossStreaks.push(lossStreak);
              lossStreak = 0;
          }

          return _.assign(game, {
              gameDifferential: game.score - game.opponentScore,
              overtime: _isOvertime
          })
      });

      career.avgPointsPerGame = career.points / career.total;
      career.winPercentage = career.wins / career.total;

      return {
          career: career,
          games: gameStats,
          maxConsecutiveWins: _.max(winStreaks),
          maxConsecutiveLosses: _.max(lossStreaks),
          overTimeWins: overtimeWins,
          overtimeLosses: overtimeLosses,
          streak: {
            count: Math.max(winStreak, lossStreak),
            type: winStreak > lossStreak ? "Win" : "Loss"
          },
          differentialSummary: _(gameStats)
              .countBy("gameDifferential")
              .map(function(value, key) {
                return { differential: parseInt(key, 10), count: value };
              })
              .sortBy("differential")
              .valueOf()
      };
  }

  function buildStatsSummary(games) {
    var stats = { games: 0, wins: 0, overtimeWins: 0, losses: 0, points: 0, aces: 0, opponentPoints: 0, opponentAces: 0 };
    var result = _.reduce(games, function (result, game) {
      result.games++;
      result.wins += game.score > game.opponentScore ? 1 : 0;
      result.losses += game.score < game.opponentScore ? 1 : 0;
      result.points += game.score;
      result.aces += game.aces;
      result.opponentPoints += game.opponentScore;
      result.opponentAces += game.opponentAces;
      return result;
    }, stats);

    return _.assign(result, {
      winPercentage: result.wins === 0 ? 0 : result.wins / result.games,
      pointsPerGame: result.points === 0 ? 0 : result.points / result.games,
      pointDifferential: result.points - result.opponentPoints
    })
  }

  _.forEach(gameData, function (game) {
    var player1 = players[game.player1_name];
    var player2 = players[game.player2_name];

    var expectedScore1 = elo.getExpected(player1.rank, player2.rank);
    var expectedScore2 = elo.getExpected(player2.rank, player1.rank);

    var actualScore1 = game.player1_score > game.player2_score ? 1 : 0;
    var actualScore2 = game.player2_score > game.player1_score ? 1 : 0;

    player1.rank = elo.updateRating(expectedScore1, actualScore1, player1.rank);
    player2.rank = elo.updateRating(expectedScore2, actualScore2, player2.rank);

    player1.games.push(_.assign(transformGame(game, "player1", "player2"), { rank: player1.rank, win: !!actualScore1 }));
    player2.games.push(_.assign(transformGame(game, "player2", "player1"), { rank: player2.rank, win: !!actualScore2 }));
  });

  _.forEach(players, function (player) {
    var opponents = _.groupBy(player.games, "opponentName");
    _.forEach(opponents, function (games, opponent) {
      player.opponents.push(_.assign({ opponentName: opponent }, buildStatsSummary(games)));
    });

    player.stats = buildStats(player.games);

      console.log(JSON.stringify(player.stats, null, 2));
  });

  return {
    lastUpdated: info.worksheetUpdated,
    players: players
  };
}

module.exports = function () {
  return bluebird.all([
    getPlayers(),
    spreadsheet("Scores")
  ]).spread(processSpreadsheet);
}

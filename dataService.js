var Q = require("q");
var _ = require("lodash");
var moment = require("moment");
var Spreadsheet = require('edit-google-spreadsheet');

var deferred;

var spreadsheetOptions = {
    debug: true,
    spreadsheetId: "1oT_G_vwbiYuh17TJhdsymFp8-ONbDMS2NckTGJtCZOE",
    worksheetName: 'Scores',
    oauth : {
        email: "780272229048-had28ms0egrbau5vsk8nh330jbukos9j@developer.gserviceaccount.com",
        keyFile: './private/pongalytics.pem'
    }
};

function sheetReady(err, spreadsheet) {
    if (err) {
        deferred.reject(err);
    }
    spreadsheet.receive(processSpreadsheet);
}

function processSpreadsheet(err, rows, info) {
    if (err) {
        deferred.reject(err);
    }



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

    var data = _.chain(rows)
        .values()
        .rest(numberOfHeaderRows)
        .map(function transformRow(row) {
            return _.mapValues(columns, function(index) {
                return row[index];
            });
        })
        .valueOf();

    var players = {};

    function player() {
        this.opponents = [];
        this.games = [];
    }

    function getPlayer(name) {
        if (!players[name]) {
            players[name] = new player();
        }
        return players[name];
    }

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
        var stats = { games: 0, wins: 0, losses: 0, points: 0, aces: 0, opponentPoints: 0, opponentAces: 0 };
        var result = _.reduce(games, function(result, game) {
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

    _.forEach(data, function(game) {
        var player1 = getPlayer(game.player1_name);
        player1.games.push(transformGame(game, "player1", "player2"));

        var player2 = getPlayer(game.player2_name);
        player2.games.push(transformGame(game, "player2", "player1"));
    });

    _.forEach(players, function(player) {
        var opponents = _.groupBy(player.games, "opponentName");
        _.forEach(opponents, function(games, opponent) {
            player.opponents.push(_.assign({ opponentName: opponent }, buildStats(games)));
        });

        player.stats = buildStats(player.games);
    });

    deferred.resolve({
        lastUpdated: info.worksheetUpdated,
        players: players
    });
}

module.exports = function () {

    deferred = Q.defer();

    Spreadsheet.load(spreadsheetOptions, sheetReady);

    return deferred.promise;
}
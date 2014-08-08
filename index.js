var Spreadsheet = require('edit-google-spreadsheet');
var _ = require("lodash");
var moment = require("moment");

var spreadsheetOptions = {
  debug: true,
  spreadsheetId: "1oT_G_vwbiYuh17TJhdsymFp8-ONbDMS2NckTGJtCZOE",
  worksheetName: 'Scores',
  oauth : {
    email: "780272229048-had28ms0egrbau5vsk8nh330jbukos9j@developer.gserviceaccount.com",
    keyFile: './private/pongalytics.pem'
  }
};

Spreadsheet.load(spreadsheetOptions, sheetReady);

function sheetReady(err, spreadsheet) {
  if (err) {
    throw err;
  }
  spreadsheet.receive(processSpreadsheet);
}

function processSpreadsheet(err, rows, info) {
  if (err) {
    throw err;
  }

  var numberOfHeaderRows = 2;

  var columns = {
    "game_number": "1",
    "game_date": "2",
    "player1_name": "3",
    "player1_score": "4",
    "player1_aces": "5",
    "player2_name": "6",
    "player2_score": "7",
    "player2_aces": "8",
    "winning_side": "9"
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

  function player(name) {
    this.name = name;
    this.games = [];
  }

  function getPlayer(name) {
    if (!players[name]) {
      players[name] = new player(name);
    }
    return players[name];
  }

  function getNumber(value) {
    if (_.isEmpty(value)) {
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

  _.each(data, function(game) {
    var player1 = getPlayer(game.player1_name);
    player1.games.push(transformGame(game, "player1", "player2"));

    var player2 = getPlayer(game.player2_name);
    player2.games.push(transformGame(game, "player2", "player1"));
  });



  console.log(players);
  console.dir(info);
}


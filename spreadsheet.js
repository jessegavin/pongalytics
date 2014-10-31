var bluebird = require("bluebird");
var Spreadsheet = require('edit-google-spreadsheet');
var fs = bluebird.promisifyAll(require('fs'));
var path = require('path');

bluebird.promisifyAll(Spreadsheet);

module.exports = function (worksheetName) {
  if (process.env.NODE_ENV === 'production') {
    return Spreadsheet.loadAsync(getSpreadSheetOptions(worksheetName))
      .then(sheetReady)
      .spread(processSpreadsheet)
      .catch(function(err) {
        console.error(err);
        throw err;
      });
  }
  // when running locally, return fake test data so you don't need PEM_KEY and DRIVE_USER
  return getTestData(worksheetName);
};

function getTestData(worksheetName) {
  var testDataMap = {
    'Players': 'test/data/players-spreadsheet.json',
    'Scores': 'test/data/scores-spreadsheet.json'
  };
  return fs.readFileAsync(path.join(__dirname, testDataMap[worksheetName]), 'utf8')
    .then(function(jsonString) {
      return JSON.parse(jsonString);
    })
    .catch(function(err) {
      console.error(err);
      throw err;
    });
}

function getSpreadSheetOptions(worksheetName){
  return {
    debug: true,
    spreadsheetId: "1oT_G_vwbiYuh17TJhdsymFp8-ONbDMS2NckTGJtCZOE",
    worksheetName: worksheetName,
    oauth: {
      email: process.env.DRIVE_USER,
      key: process.env.PEM_KEY
    }
  }
}

function sheetReady(spreadsheet) {
  bluebird.promisifyAll(spreadsheet);
  return spreadsheet.receiveAsync();
}

function processSpreadsheet(rows, info) {
  return {
    rows: rows,
    info: info
  };
}

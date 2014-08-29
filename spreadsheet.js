var bluebird = require("bluebird");
var Spreadsheet = require('edit-google-spreadsheet');

bluebird.promisifyAll(Spreadsheet);

module.exports = function (worksheetName) {
  return Spreadsheet.loadAsync(getSpreadSheetOptions(worksheetName))
    .then(sheetReady)
    .spread(processSpreadsheet)
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
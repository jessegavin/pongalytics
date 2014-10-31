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
      email: "780272229048-had28ms0egrbau5vsk8nh330jbukos9j@developer.gserviceaccount.com", //process.env.DRIVE_USER,
      keyFile: "./private/pongalytics.pem" //process.env.PEM_KEY
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

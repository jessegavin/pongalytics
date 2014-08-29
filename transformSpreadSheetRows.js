var _ = require("lodash");

module.exports = function(columns, rows, skip) {
  return _.chain(rows)
    .values()
    .rest(skip)
    .map(function transformRow(row) {
      return _.mapValues(columns, function (index) {
        return row[index];
      });
    })
    .valueOf();
};
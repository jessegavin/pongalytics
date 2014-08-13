
var getData = require('./dataService');
getData()
    .then(function(data) {
        console.log(data);
    }, function(error){
        console.error(error);
    });
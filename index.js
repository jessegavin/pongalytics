var _ = require('lodash');
var getData = require('./dataCache');
var express = require('express');
var exphbs  = require('express3-handlebars');
var numeral  = require('numeral');
var app = express();

var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        decimal: function(value) {
            return numeral(value).format('0.00');
        },
        percentage: function(value) {
            return numeral(value).format('0.0%');
        },
        numeric: function(value) {
            return numeral(value).format('0,0');
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    getData(req.query.forceRefresh)
        .then(function(data) {

            var viewModel = {
                players: _.chain(data.players)
                          .map(function(p, name) {
                            return _.assign(p, { name: name });
                          })
                          .sortBy(function(p) {
                            return 0-p.rank;
                          })
                          .valueOf()
            };

            res.render('home', viewModel);
        }, function(error) {
            res.status(500).body(error);
        });
});

app.listen(process.env.PORT || 8080);
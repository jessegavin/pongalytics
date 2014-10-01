var viewmodel = require('./viewmodel');
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
    viewmodel(req.query.bypassCache)
        .then(function(model) {
            res.render('home', model);
        })
        .catch(function(error) {
            throw error;
        });
});


app.get('/data.json', function(req, res) {
    viewmodel(req.query.bypassCache)
        .then(function(model) {
            res.json(model);
        })
        .catch(function(error) {
            throw error;
        });
});

app.listen(process.env.PORT || 8080);
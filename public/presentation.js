var element = document.querySelector("#chart");
var timeOffsetInMilliseconds = new Date().getTimezoneOffset() * 60 * -1;
var json;

function renderMainGraph() {

    var series = _.map(json.players, function(player) {

        return {
            name: player.name,
            data: _(player.games)
                .map(function(g) {
                    return {
                        y: g.rank,
                        x: g.gameDate
                    }
                })
                .groupBy("x")
                .map(function(values, key) {
                    return {
                        x: (Date.parse(key) / 1000) + timeOffsetInMilliseconds,
                        y: _.last(values).y
                    }
                })
                .sortBy("x")
                .valueOf(),
            color: randomColor()
        }
    });

    var graph = new Rickshaw.Graph({
        element: element,
        renderer: 'lineplot',
        series: series,
        min: "auto",
        padding: {
            top: 0.03,
            bottom: 0.03
        }
    });

    var x_axis = new Rickshaw.Graph.Axis.Time( {
        graph: graph
    });


    var y_axis = new Rickshaw.Graph.Axis.Y( {
        graph: graph,
        orientation: 'left',
        element: document.getElementById('y_axis'),
    });

    graph.render();


    var legend = document.querySelector("#legend");

    var legendItems = series.map(function(s) {

        var line = document.createElement('div');
        line.className = 'legend-item';

        var swatch = document.createElement('span');
        swatch.className = 'legend-item__swatch';
        swatch.style.backgroundColor = s.color;

        var label = document.createElement('span');
        label.className = 'legend-item__name';
        label.innerText = s.name;

        var value = document.createElement('span');
        value.className = 'legend-item__value';
        value.innerText = '';

        line.appendChild(swatch);
        line.appendChild(label);
        line.appendChild(value);
        legend.appendChild(line);

        return line;
    });


    var datetime = document.querySelector("#datetime");

    var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
        render: function(args) {

            datetime.innerText = moment.unix(args.domainX).format("LL");

            args.points.sort(function(a, b) { return a.order - b.order }).forEach( function(d, index) {

                legendItems[index].lastChild.innerText = d.value.y;
                this.show();

            }, this );
        }
    });

    var hover = new Hover( { graph: graph } );
}


function renderComparison(player1, player2) {

    var rc = new RandomColor();

    var series = _.map(json.players, function(player) {

        return {
            name: player.name,
            data: _(player.games)
                .map(function(g) {
                    return {
                        y: g.rank,
                        x: g.gameDate
                    }
                })
                .groupBy("x")
                .map(function(values, key) {
                    return {
                        x: (Date.parse(key) / 1000) + timeOffsetInMilliseconds,
                        y: _.last(values).y
                    }
                })
                .sortBy("x")
                .valueOf(),
            color: randomColor()
        }
    });

    var graph = new Rickshaw.Graph({
        element: element,
        renderer: 'lineplot',
        series: series,
        min: "auto",
        padding: {
            top: 0.03,
            bottom: 0.03
        }
    });

    var x_axis = new Rickshaw.Graph.Axis.Time( {
        graph: graph
    });


    var y_axis = new Rickshaw.Graph.Axis.Y( {
        graph: graph,
        orientation: 'left',
        element: document.getElementById('y_axis'),
    });

    graph.render();


    var legend = document.querySelector("#legend");

    var legendItems = series.map(function(s) {

        var line = document.createElement('div');
        line.className = 'legend-item';

        var swatch = document.createElement('span');
        swatch.className = 'legend-item__swatch';
        swatch.style.backgroundColor = s.color;

        var label = document.createElement('span');
        label.className = 'legend-item__name';
        label.innerText = s.name;

        var value = document.createElement('span');
        value.className = 'legend-item__value';
        value.innerText = '';

        line.appendChild(swatch);
        line.appendChild(label);
        line.appendChild(value);
        legend.appendChild(line);

        return line;
    });


    var datetime = document.querySelector("#datetime");

    var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
        render: function(args) {

            datetime.innerText = moment.unix(args.domainX).format("LL");

            args.points.sort(function(a, b) { return a.order - b.order }).forEach( function(d, index) {

                legendItems[index].lastChild.innerText = d.value.y;
                this.show();

            }, this );
        }
    });

    var hover = new Hover( { graph: graph } );
}

d3.json("/data.json", function(error, response) {
    json = response;
    renderMainGraph("#chart");
});

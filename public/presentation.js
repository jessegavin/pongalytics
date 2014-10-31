var element = document.querySelector("#chart");
var timeOffsetInMilliseconds = new Date().getTimezoneOffset() * 60 * -1;
var json;

var palette = [
'#66CC99',
'#66CCCC',
'#6699CC',
'#6666CC',
'#9966CC',
'#CC66CC',
'#CC6699',
'#CC6666',
'#CC9966',
'#CCCC66',
'#99CC66',
'#66CC66',
'#3DB87A',
'#2E8A5C',
'#B83D7A',
'#8A2E5C'
];

function renderMainGraph() {

    var series = _.map(json.players, function(player, index) {

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
            color: palette[index % palette.length]
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

    var ranks = series.map(function(s) {
        document.getElementById('name-'+ s.name).style.backgroundColor = s.color;
        return document.getElementById('rank-'+ s.name);
    });


    var datetime = document.querySelector("#datetime");

    // var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
    //     render: function(args) {
    //
    //         datetime.innerText = moment.unix(args.domainX).format("LL");
    //
    //         args.points.sort(function(a, b) { return a.order - b.order }).forEach( function(d, index) {
    //
    //             ranks[index].innerText = d.value.y;
    //             this.show();
    //
    //         }, this );
    //     }
    // });
    //
    // var hover = new Hover( { graph: graph } );



    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
        yFormatter: function(y) { return Math.floor(y) }
    });

    //var hover = new Hover( { graph: graph } );


var slider = new Rickshaw.Graph.RangeSlider({
    graph: graph,
    element: document.querySelector('#slider')
});

    var yAxis = document.getElementById("y_axis");
    var container = document.getElementById("chart_container");

    var resize = function() {
      graph.configure({
        width: container.offsetWidth - yAxis.offsetWidth
      });
      graph.render();
    }
    window.addEventListener('resize', resize);
    resize();
}

d3.json("/data.json", function(error, response) {
    json = response;
    renderMainGraph("#chart");
});

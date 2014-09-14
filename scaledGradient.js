var scores = [ [11,1], [2,11], [11,8] ];

var scores_copy = [];
scores.forEach( function( item) {
	scores_copy = scores_copy.concat( item );
});

var max_score = Math.max.apply( null, scores_copy);

var scaledGradientScores = [];

scores.forEach( function( item ) {
	console.log ( item );
	console.log ( Math.round( 1000 * (item[0]/item[1] ) / max_score ) /1000  ) ;
	scaledGradientScores.push( Math.round( 1000 * (item[0]/item[1] ) / max_score ) /1000  ) ;
	});

console.log( 'scaledGradientScores ' + scaledGradientScores );

function flatten(  input ) {
    if( input && input.length == 0 ) {
        return [];
    }
    else if( typeof input == 'number' ) {
        return [input];
    }
    else if ( input && Array.isArray( input ) ) {
            var result = flatten( input.shift());
            return result.concat( flatten( input ) );
    }
}

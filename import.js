var async = require( 'async' ),
    OpenPathsAPI = require( 'openpaths-api' ),
    fs = require( 'fs' ),
    path = require( 'path' );

// Run setup (checking arguments), validate Latitude JSON, make API requests
function runImport() {
    async.waterfall([
        setup,
        validateLatitudeJSON,
        sendDataToOpenPaths
    ], function( err ) {
        if ( ! err ) {
            console.log( 'FINISHED!' );
            process.exit( 0 );
        } else {
            console.log( err );
        }
    });
}

// Check existence of arguments
function setup( callback ) {
    var options = {
        openPathsKey: '',
        openPathsSecret: '',
        latitudeFile: ''
    };

    if ( process.argv.length === 5 ) {
        options.openPathsKey = process.argv[ 2 ];
        options.openPathsSecret = process.argv[ 3 ];
        options.latitudeFile = path.resolve( __dirname, process.argv[4] );
    } else {
        callback( new Error('Invalid syntax. Please use $ node import.js [OpenPaths Key] [OpenPaths Secret] [Latitude File]') );
        return false;
    }

    callback( null, options );
}

// Validate and parse the latitude file JSON data
function validateLatitudeJSON( options, callback ) {
    fs.readFile( options.latitudeFile, 'utf8', function( err, contents ) {
        var unparsedData;

        if ( err ) {
            callback( new Error(err) );
            return false;
        }

        try {
            unparsedData = JSON.parse( contents );

            options.latitudePoints = parseLatitudeData( unparsedData );
        } catch ( e ) {
            callback( new Error(options.latitudeFile + 'is not valid JSON') );
            return false;
        }

        callback( null, options );
    });
}

// Prepare data to be sent to OpenPaths
function sendDataToOpenPaths( options, callback ) {
    var pointsPerRequest = 2000,
        totalRequests = 1;

    console.log( 'Importing a total of', options.latitudePoints.length, 'latitude points...' );

    if ( options.latitudePoints.length > 2000 ) {
        totalRequests = Math.ceil( options.latitudePoints.length / pointsPerRequest );

        async.timesSeries( totalRequests, function( index, _callback ) {
            var pagedPoints = options.latitudePoints.slice( index * pointsPerRequest, (index + 1) * pointsPerRequest );

            makeAPIRequest( options, pagedPoints, _callback );
        }, callback );
    } else {
        makeAPIRequest( options, options.latitudePoints, callback );
    }
}

// Send data to OpenPaths, making the API request
function makeAPIRequest( options, latitudePoints, callback ) {
    var openPaths = new OpenPathsAPI({
        key: options.openPathsKey,
        secret: options.openPathsSecret
    });

    console.log( 'Importing', latitudePoints.length, '...' );

    openPaths.postPoints( latitudePoints, function( err, response, data ) {
        if ( err ) {
            callback( new Error(JSON.stringify(err)) );
            return false;
        }

        if ( data && data.success === 'true' ) {
            console.log( latitudePoints.length, 'points successfully imported!' );
        } else {
            console.log( data );
        }

        callback( null );
    });
}

// Parse Latitude data into OpenPaths format
function parseLatitudeData( unparsedData ) {
    var parsedPoints = [];

    unparsedData.locations.forEach( function( location ) {
        var point = {
            lat: ( location.latitudeE7 / 10000000 ), // Latitude's latitude comes in [lat] * 10^7
            lon: ( location.longitudeE7 / 10000000 ), // Latitude's longitude comes in [lat] * 10^7
            alt: 0, // Latitude has no altitude information, sadly
            t: Math.round( parseInt(location.timestampMs, 10) / 1000 ) // Latitude's timestamp comes in milliseconds, and OpenPaths' is in seconds
        };

        parsedPoints.push( point );
    });

    return parsedPoints;
}

module.exports = runImport();
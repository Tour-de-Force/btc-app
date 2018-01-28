/*global FileTransfer*/
import { cloneDeep } from 'lodash';
import path from 'path';
import { fromJS } from 'immutable';

import usbr20 from '../usbr20.json';

import { MBTILES_SERVER, MBTILES_SERVER_ROOT, hackDatabasePath } from '../config';

const REQUEST = 'btc-app/tracks/REQUEST';
const RECEIVE = 'btc-app/tracks/RECEIVE';
const CLEAR = 'btc-app/tracks/CLEAR';
const ACTIVATE = 'btc-app/tracks/ACTIVATE';
const DEACTIVATE = 'btc-app/tracks/DEACTIVATE';

/**
 * TODO: Investigate performance hit of loading waypoints JSON into
 * the Immutable data structure
 * TODO: Obtain tracks from the database
 */
const initState = fromJS( {
  'usbr-1': {
    _id: 'usbr-1',
    name: 'USBR 1',
    number: 20,
    description: 'This route travels between Key West, FL and Calais, ME.',
    pkg: 'usbr20.mbtiles',
    status: 'absent',
    isFetching: false,
    active: false,
    sizeMiB: 4.7,
    sha256: null, // TODO: implement digest check to verify downloads
    boundingBox: [ [ 47.320206883852414, -66.81884765625001 ], [ 24.544624809190402, -81.77261352539062 ] ],
    waypoints: usbr20 // See above
  },
  'usbr-20': {
    _id: 'usbr-20',
    name: 'USBR 20',
    number: 20,
    description: 'This route begins in Luddington, MI and ends near Detroit in Marine City, MI.',
    pkg: 'usbr20.mbtiles',
    status: 'absent',
    isFetching: false,
    active: false,
    sizeMiB: 4.7,
    sha256: null,
    boundingBox: [ [ 44.13787021128985, -86.57020568847658 ], [ 42.69505333013366, -82.3909378051758 ] ],
    waypoints: usbr20 // See above
  }
} );

export default function reducer( state = initState, action ) {
  switch ( action.type ) {
  case REQUEST:
    state = cloneDeep( state );
    return state.mergeDeepIn( [ action.id ], {
      isFetching: action.progress
    } );
  case RECEIVE:
    state = cloneDeep( state );
    return state.mergeDeepIn( [ action.id ], {
      isFetching: false,
      status: action.status
    } );
  case CLEAR:
    state = cloneDeep( state );
    return state.mergeDeepIn( [ action.id ], {
      status: 'absent'
    } );
  case DEACTIVATE:
    state = cloneDeep( state );
    return state.mergeDeepIn( [ action.id ], {
      active: false
    } );
  case ACTIVATE:
    state = cloneDeep( state );
    return state.mergeDeepIn( [ action.id ], {
      active: true
    } );
  default:
    return state;
  }
}

/*
 * Creates an action thunk to async download mbtiles packages for tracks. The
 * download is performed with the cordova-plugin-file-transfer plugin.
 */
export function fetchTrack( id, pkg ) {
  return dispatch => {

    // Inform app state the track download is starting
    dispatch( requestTrack( id, true ) );

    const transfer = new FileTransfer();
    const source = encodeURI( `http://${MBTILES_SERVER}/${MBTILES_SERVER_ROOT}/${pkg}` );

    /*
     * In a perfect world, this commented out code is the best solution.
     * See `hackDatabasePath`
     *
     * return Promise.resolve(`${MBTILES_LOCAL_ROOT}/${pkg}`).then(target => {
     */

    return hackDatabasePath().then( databasePath => {
      return new Promise( ( resolve, reject ) => {

        const target = path.join( databasePath, pkg );

        // Use cordova-plugin-file-transfer to initiate the download
        transfer.download( source, target, entry => {
          resolve( entry );
        }, error => {
          console.error( `fetch error code ${error.code}` );
          reject( error );
        },
          true );

        // Only dispatch updates every 10% to improve performance. If we ever
        // cannot determine the size of the download, mark progress as
        // indeterminate.
        let last = 0.0;
        transfer.onprogress = e => {
          if ( e.lengthComputable ) {
            const fract = e.loaded / e.total;
            if ( fract >= last ) {
              last = last + 0.1;
              dispatch( requestTrack( id, fract ) );
            }
          } else {
            dispatch( requestTrack( id, true ) );
          }
        };

      } );

    } ).then( entry => {
      dispatch( receiveTrack( id, 'available' ) );
    } ).catch( error => {
      dispatch( receiveTrack( id, 'failed' ) );
    } );
  };
}

/*
 * Create action to notify store a download has been initiated. This action
 * creator should only be used within fetchTrack.
 *
 * The progress argument can either be true, or a finite number. `true`
 * represents an indeterminate download. When progress is a number, it should
 * be a float between 0.0 and 1.0 representing download progress.
 */
function requestTrack( id, progress ) {
  return { type: REQUEST, id, progress };
}

/*
 * Create action to notify store an async track package download has completed.
 * This action creator should only be used within fetchTrack.
 */
function receiveTrack( id, status ) {
  return { type: RECEIVE, id, status };
}

/*
 * Create action to clear a downloaded track from memory.
 * TODO: Implement clearTrack.
 */
export function clearTrack( id ) {
  console.log( 'TODO: `clearTrack: remove associated mbtiles pkg`' );
  return { type: CLEAR, id };
}

/*
 * Show a track on the map.
 */
export function activateTrack( id ) {
  return { type: ACTIVATE, id };
}

/*
 * Hide a track from the map
 */
export function deactivateTrack( id ) {
  return { type: DEACTIVATE, id };
}

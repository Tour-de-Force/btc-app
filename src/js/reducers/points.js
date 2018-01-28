/*global XMLHttpRequest FormData*/
import { baseUrl } from '../util/server';
import { photoBaseUrl } from '../database';
import { Agent, observeStore } from '../util/agent';

import { local, remote, reset } from '../database';
import { setSnackbar } from './notifications/snackbar';

import { Point, Service, Alert, PointCollection } from 'btc-models';
import { set, unset, bindAll, cloneDeep } from 'lodash';

import { blobToBase64String, base64StringToBlob } from 'blob-util';

import { REHYDRATE } from 'redux-persist/constants';

export const ADD_SERVICE = 'btc-app/points/ADD_SERVICE';
export const ADD_ALERT = 'btc-app/points/ADD_ALERT';
export const UPDATE_SERVICE = 'btc-app/points/UPDATE_SERVICE';
export const RESCIND_POINT = 'btc-app/points/RESCIND_POINT';
export const RELOAD_POINTS = 'btc-app/points/RELOAD_POINTS';
export const REQUEST_LOAD_POINT = 'btc-app/points/REQUEST_LOAD_POINT';
export const RECEIVE_LOAD_POINT = 'btc-app/points/RECEIVE_LOAD_POINT';
export const REQUEST_REPLICATION = 'btc-app/points/REQUEST_REPLICATION';
export const RECEIVE_REPLICATION = 'btc-app/points/RECEIVE_REPLICATION';
export const REQUEST_PUBLISH = 'btc-app/points/REQUEST_PUBLISH';
export const RECEIVE_PUBLISH = 'btc-app/points/RECEIVE_PUBLISH';
export const CLEAR_CACHED_POINTS = 'btc-app/points/CLEAR_CACHED_POINTS';
export const SET_URL_FOR_POINTID = 'btc-app/points/SET_URL_FOR_POINTID';

// # Points Reducer
// The points reducer holds the points, their comments, and relevant metadata
//
// The point structure is augmented with an `isFetching` field that is true
// while the database fetch is running.
const initState = {
  points: {},
  unpublishedCoverPhotos: {},
  coverPhotoUrls: {},
  replication: {
    inProgress: false,
    time: null
  },
  publish: {
    inProgress: false,
    updated: []
  }
};

export default function reducer( state = initState, action ) {
  switch ( action.type ) {
  case REHYDRATE:
    state = cloneDeep( state );
    var incoming = action.payload.points;
    if ( incoming ) {
      // Clear the photo URLs; local ones are transient and only valid for the current page load;
      // they will be regenerated next time they are needed.
      state = { ...state, ...incoming, coverPhotoUrls: {} };
    }
    return state;
  case UPDATE_SERVICE:
  case ADD_SERVICE:
  case ADD_ALERT:
    state = cloneDeep( state );
    // Make sure the point isn't already in our updated list.
    if ( state.publish.updated.indexOf( action.id ) < 0 ) {
      let updatedPoints = cloneDeep( state.publish.updated );
      updatedPoints.push( action.id );
      set( state, 'publish.updated', updatedPoints );
    }
    set( state, 'points.' + action.id, action.point );

    if ( action.photo ) {
      set( state, 'unpublishedCoverPhotos.' + action.id, action.photo );
      // Clear the URL to make sure we get the new (local) photo next time
      unset( state, 'coverPhotoUrls.' + action.id );
    }
    return state;
  case RESCIND_POINT:
    state = cloneDeep( state );
    // Make sure the point is in our updated list.
    var updatedPoints = cloneDeep( state.publish.updated );
    var idIndex = updatedPoints.indexOf( action.id );
    if ( idIndex >= 0 ) {
      // Remove the point from our updated list.
      updatedPoints.splice( idIndex, 1 );
      // Update the updated list.
      set( state, 'publish.updated', updatedPoints );
      // Unset the point (it should be readded to the state with reloadPoints).
      unset( state, 'points.' + action.id );
      // Clear any photo for it
      unset( state, 'unpublishedCoverPhotos.' + action.id );
      unset( state, 'coverPhotoUrls.' + action.id );
    } else {
      console.warn( 'Trying to remove a point that was not added.' );
    }
    return state;
  case RELOAD_POINTS:
    state = cloneDeep( state );
    set( state, 'points', action.points );
    return state;
  case REQUEST_LOAD_POINT:
    state = cloneDeep( state );
    set( state, 'points.' + action.id, { isFetching: true } );
    return state;
  case RECEIVE_LOAD_POINT:
    state = cloneDeep( state );
    set( state, 'points.' + action.id, { isFetching: false, ...action.point } );
    return state;
  case REQUEST_REPLICATION:
    state = cloneDeep( state );
    set( state, 'replication', { time: action.time, inProgress: true } );
    return state;
  case RECEIVE_REPLICATION:
    state = cloneDeep( state );
    set( state, 'replication', { time: action.time, inProgress: false } );
    // Clear the photo URLs; they will be regenerated next time they are needed.
    set( state, 'coverPhotoUrls', {} );
    return state;
  case REQUEST_PUBLISH:
    state = cloneDeep( state );
    set( state, 'publish.inProgress', true );
    return state;
  case RECEIVE_PUBLISH:
    state = cloneDeep( state );
    set( state, 'publish.inProgress', false );
    if ( action.err == null ) {
      set( state, 'publish.updated', [] );
      set( state, 'unpublishedCoverPhotos', {} );
    }
    return state;
  case CLEAR_CACHED_POINTS:
    state = cloneDeep( state );
    // Clear the state's version of the points.
    set( state, 'points', {} );
    // This only clears the list of unpublished points, not the points themselves.
    set( state, 'publish.updated', [] );
    // Clear any unpublished photos.
    set( state, 'unpublishedCoverPhotos', {} );
    // Clear the photo URLs; they will be regenerated next time they are needed.
    set( state, 'coverPhotoUrls', {} );
    return state;
  case SET_URL_FOR_POINTID:
    state = cloneDeep( state );
    set( state, 'coverPhotoUrls.' + action.pointId, action.url );
    return state;
  default:
    return state;
  }
}

// # Generic Add & Update Logic
//
// This function makes an action creator suitable for adding and updating
// alerts and services.
//
// The returned action creator function takes two arguments:
//
//  1. point -- the alert or service model instance to save, from btc-models
//  2. coverBlob -- an optional image to attach to the point
//
// Action creators (that do not utilize redux-thunk) must return an action.
// When the user adds an alert or service, this should be done synchronously,
// without delay. We must also persist the change to the database. The flow
// goes as follows:
//
//  - Check if the point is valid
//  - If this is an update, mark the point as updated
//  - Make a promise to save the point to the database
//    * By default, just save it
//    * For UPDATE_SERVICE, re-fetch the point to get our `_rev`
//  - If there's a coverBlob, attach it
//  - Serialize the point and return the action
const factory = type => {
  return ( point, coverBlob ) => {
    if ( !point.isValid() ) {
      console.error( 'the submitted point was not valid!' );
    } else {
      point.specify();

      let promise;
      if ( type === UPDATE_SERVICE ) {
        const attributes = cloneDeep( point.attributes );
        promise = point.fetch().then( res => point.save( attributes ) );
      } else {
        promise = point.save();
      }

      if ( coverBlob ) {
        return dispatch => promise.then( () => {
          return blobToBase64String( coverBlob );
        } ).then( ( base64Blob ) => dispatch( { type, id: point.id, point: point.store(), photo: base64Blob } ) );
      } else {
        return dispatch => promise.then( () => dispatch( { type, id: point.id, point: point.store() } ) );
      }
    }
  };
};
export const addService = factory( ADD_SERVICE );
export const addAlert = factory( ADD_ALERT );
export const updateService = factory( UPDATE_SERVICE );

// # Rescind Point
// Allows the user to delete points that haven't yet been synced to another
// database. After a point is synced the first time, it cannot be deleted
export function rescindPoint( id ) {
  return dispatch => {
    dispatch( { type: RESCIND_POINT, id } );
    dispatch( reloadPoints() );
  };
}

// # Reload Points
// Creates an action to replace all points in the store. This is useful to
// load the store with initial point data and to refresh the store when
// the user scrolls to a new area of the map.
export function reloadPoints() {
  const points = new PointCollection();
  return dispatch => {
    return points.fetch().then( res => {

      //copy all points into new variable
      let allPoints = points.store();

      //copy only visible points into this new variable.
      var visiblePoints = {};

      //getting all keys of all points.
      let allKeys = Object.keys( allPoints );

      //loop over all keys and copy each key value if it is visible
      allKeys.forEach( function( key ) {
        /* ( If key is not hidden ) AND ( No Expiration Field OR Expiration is Greater than Now )
         * Then display the point.*/
        if ( allPoints[ key ].is_hidden == false && ( allPoints[ key ].expiration_date == null || new Date( allPoints[ key ].expiration_date ) > new Date() ) ) {
          visiblePoints[ key ] = allPoints[ key ];
        }
      } );
      dispatch( { type: RELOAD_POINTS, points: visiblePoints } );
    } );
  };
}

export function clearCachedPoints() {
  return { type: CLEAR_CACHED_POINTS };
}

// # Reset Points
// Reset the points database then reload the (empty) database.
export function resetPoints() {
  return dispatch => reset().then( () => dispatch( clearCachedPoints() ) ).then( () => dispatch( replicatePoints() ) ).then( () => dispatch( setSnackbar( { message: 'Cleared point cache and reloaded points' } ) ) );
}

// # Load Point
// Load a point into the store.
//
// If the point's id is already in the store, it is either already loaded, or it
// is currently being fetched. In either case, return immediately to avoid
// stack overflow.
//
// Otherwise, fetch the point from the database, and mark the point as fetching
// while it is being retrieved.
export function loadPoint( id ) {
  return ( dispatch, getState ) => {
    const {points} = getState().points;

    if ( !points[ id ] ) {
      dispatch( { type: REQUEST_LOAD_POINT, id } );

      const point = Point.for( id );
      return point.fetch().then( res => {
        dispatch( { type: RECEIVE_LOAD_POINT, point: point.store() } );
      } );
    }
  };
}

//Calling the server API flag
export function flagPoint( id, reason ) {
  return ( dispatch, getState ) => {
    const {account} = getState();
    return new Promise( ( resolve, reject ) => {
      const request = new XMLHttpRequest();
      request.open( 'POST', baseUrl + '/flag' );
      request.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
      request.setRequestHeader( 'authorization', 'JWT ' + account.login.token );

      var jsonData = JSON.stringify( { 'pointId': id, 'flagReason': reason } );

      request.onload = event => {
        if ( request.status === 200 ) {
          resolve( request );
        } else {
          reject( request );
        }
      };
      request.onerror = event => {
        reject( request );
      };
      request.send( jsonData );
    } ).then( res => {
      dispatch( setSnackbar( { message: 'Successfully flagged point' } ) );
    } ).catch( err => {
      if ( err.status === 401 ) {
        dispatch( setSnackbar( { message: 'You must be logged in to flag points' } ) );
      } else if ( err.status === 400 ) {
        dispatch( setSnackbar( { message: JSON.parse( err.responseText ).error } ) );
      } else {
        dispatch( setSnackbar( { message: 'Unable to contact the server to flag the point' } ) );
      }
    } );

  };
}

// Returns either the local (non-published) cover image URL or
// the URL to the remote image if one exists.
export function getCoverPhotoURLForPointId( pointId ) {
  return ( dispatch, getState ) => {
    let state = getState();

    if ( state.points.coverPhotoUrls[ pointId ] == null ) {
      if ( state.points.unpublishedCoverPhotos[ pointId ] ) {
        return Promise.resolve().then( () => {
          base64StringToBlob( state.points.unpublishedCoverPhotos[ pointId ] ).then( ( coverPhotoBlob ) => {
            let theUrl = URL.createObjectURL( coverPhotoBlob );
            dispatch( { type: SET_URL_FOR_POINTID, pointId: pointId, url: theUrl } );
          } );
        } );
      } else {
        let testRemoteURL = photoBaseUrl + '/' + encodeURIComponent( pointId ) + '/coverPhoto.jpg';

        const request = new XMLHttpRequest();
        request.open( 'HEAD', testRemoteURL );
        request.onload = event => {
          if ( request.status != 404 ) {
            dispatch( { type: SET_URL_FOR_POINTID, pointId: pointId, url: testRemoteURL } );
          } else {
            console.log( 'The above 404 is normal. We are just checking if there is a remote photo for this point.' );
          }
        };
        request.send();
      }
    }
  };
}

// # Replicate Points
// Start a replication job from the remote points database.
export function replicatePoints() {
  return dispatch => {
    const time = new Date().toISOString();
    dispatch( { type: REQUEST_REPLICATION, time } );

    return local.replicate.from( remote, { retry: true } ).then( result => {
      dispatch( { type: RECEIVE_REPLICATION, time: result.end_time } );
    } ).then( () => dispatch( reloadPoints() ) )
      .catch( err => {
        console.log( err );
        dispatch( { type: RECEIVE_REPLICATION, time: err.end_time } );
        dispatch( setSnackbar( { message: 'Unable to get points of interest from server' } ) );
      } );
  };
}

export function replicatePointsWithCallback( callbackFunc ) {
  return dispatch => Promise.resolve().then( () => dispatch( replicatePoints() ) ).then( () => callbackFunc() );
}

// # Replication Agent
// The agent's job is to continually dispatch a replication action at the
// specified interval from settings, but only if we're online. We restart
// the interval whenever:
//
//  1. The network state changes
//  2. The user specifies a new replication interval
//  3. The app resumes from sleep
//
// Stop the agent with stop().
export class ReplicationAgent extends Agent {
  constructor( store ) {
    super( store );
    this.store = store;
    this.publishInterval = false;
    this.replicationInterval = false;

    bindAll( this, 'update' );
  }

  select( state ) {
    return {
      isOnline: state.network.isOnline,
      repIvalM: state.settings.repIvalM || 10,
      login: state.account.login,
      updatedLength: state.points.publish.updated.length
    };
  }

  run() {
    const {store, select, update} = this;
    this.stop = observeStore( store, select, update );

    document.addEventListener( 'resume', update );
    update();
  }

  update() {
    const {isOnline, repIvalM, login, updatedLength} = this.select( this.store.getState() );
    clearTimeout( this.replicationInterval );
    if ( isOnline ) {
      this.store.dispatch( replicatePoints() );
      this.replicationInterval = setInterval(
        () => this.store.dispatch( replicatePoints() ),
        repIvalM * 60 * 1000
      );
    }
    clearTimeout( this.publishInterval );
    if ( isOnline && login.loggedIn && updatedLength > 0 ) {
      this.store.dispatch( publishPoints() );
      this.publishInterval = setInterval(
        () => this.store.dispatch( publishPoints() ),
        repIvalM * 60 * 1000
      );
    }
  }
}

export function publishPoints() {
  return ( dispatch, getState ) => {
    const {points, account} = getState();

    dispatch( { type: REQUEST_PUBLISH } );

    const publish = new PointCollection( [], {
      keys: points.publish.updated
    } );

    return publish.fetch().then( res => {
      return buildFormData( publish.models, points.unpublishedCoverPhotos );
    } ).then( formData => {
      return new Promise( ( resolve, reject ) => {
        const request = new XMLHttpRequest();
        request.open( 'POST', baseUrl + '/publish' );
        request.setRequestHeader( 'authorization', 'JWT ' + account.login.token );
        request.onload = event => {
          if ( request.status === 200 ) {
            resolve( request );
          } else {
            reject( request );
          }
        };
        request.onerror = event => {
          reject( request );
        };
        request.send( formData );
      } );
    } ).then( res => {
      dispatch( { type: RECEIVE_PUBLISH } );
      replicatePoints();
      dispatch( setSnackbar( { message: 'Published points of interest' } ) );
    } ).catch( err => {
      dispatch( { type: RECEIVE_PUBLISH, err } );
      if ( err.status === 401 ) {
        dispatch( setSnackbar( { message: 'You must be logged in to publish points' } ) );
      } else {
        dispatch( setSnackbar( { message: 'Unable to publish points of interest to server' } ) );
      }
    } );
  };
}

function buildFormData( models, unpublishedCoverPhotos ) {
  const serialized = [];
  const covers = [];

  models.filter(
    model => [ Service, Alert ].some( ctr => model instanceof ctr )
  ).forEach(
    model => {
      const json = model.toJSON();
      if ( unpublishedCoverPhotos[ model.id ] ) {
        json.index = covers.length;
        covers.push( unpublishedCoverPhotos[ model.id ] );
      }
      serialized.push( json );
    }
  );
  const stringified = JSON.stringify( serialized );

  const formData = new FormData();
  formData.append( 'models', stringified );

  var convertAndAppend = function( cover ) {
    return base64StringToBlob( cover ).then( ( coverPhotoBlob ) => {
      formData.append( 'covers', coverPhotoBlob, 'coverPhoto.jpg' );
    } );
  };

  let coverPhotoBlobs = covers.map( convertAndAppend );

  return Promise.all( coverPhotoBlobs ).then( () => {
    return formData;
  } );
}

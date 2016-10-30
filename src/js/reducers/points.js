/*global XMLHttpRequest FormData*/
import { baseUrl } from '../util/server';
import { Agent, observeStore } from '../util/agent';

import { local, remote, reset } from '../database';
import { setSnackbar } from './notifications/snackbar';

import { Point, Service, Alert, Comment, PointCollection } from 'btc-models';
import { set, unset, bindAll, cloneDeep } from 'lodash';

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

const UPDATED_POINTS_LOCALSTORAGE_KEY = 'UPDATED_POINTS_LOCALSTORAGE_KEY'

// # Points Reducer
// The points reducer holds the points, their comments, and relevant metadata
//
// The point structure is augmented with an `isFetching` field that is true
// while the database fetch is running.
const initState = {
  points: {},
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
  state = cloneDeep( state );
  const idPath = 'points.' + action.id;
  switch ( action.type ) {
  case UPDATE_SERVICE:
  case ADD_SERVICE:
  case ADD_ALERT:
    // Make sure the point isn't already in our updated list.
    if(state.publish.updated.indexOf(action.id) < 0) {
      state.publish.updated.push(action.id);
    }
    
    localStorage.setItem(UPDATED_POINTS_LOCALSTORAGE_KEY, JSON.stringify(state.publish.updated));
    set( state, idPath, action.point );
    break;
  case RESCIND_POINT:
	// Make sure the point is in our updated list.
	var idIndex = state.publish.updated.indexOf(action.id)
    if(idIndex >= 0) {
    	// Remove the point from our updated list.
      state.publish.updated.splice(idIndex, 1);
    } else {
    	console.warn("Trying to remove a point that wasn't added.");
    }
    localStorage.setItem(UPDATED_POINTS_LOCALSTORAGE_KEY, JSON.stringify(state.publish.updated));
    // Remove the updates from the local database.
    unset( state, idPath );
    break;
  case RELOAD_POINTS:
    var updatedPointString = localStorage.getItem(UPDATED_POINTS_LOCALSTORAGE_KEY);
    if (updatedPointString != null) {
      state.publish.updated = JSON.parse(updatedPointString);
    }
    set( state, 'points', action.points );
    break;
  case REQUEST_LOAD_POINT:
    set( state, idPath, { isFetching: true } );
    break;
  case RECEIVE_LOAD_POINT:
    set( state, idPath, { isFetching: false, ...action.point } );
    break;
  case REQUEST_REPLICATION:
    set( state, 'replication', { time: action.time, inProgress: true } );
    break;
  case RECEIVE_REPLICATION:
    set( state, 'replication', { time: action.time, inProgress: false } );
    break;
  case REQUEST_PUBLISH:
    set( state, 'publish.inProgress', true );
    break;
  case RECEIVE_PUBLISH:
    set( state, 'publish.inProgress', false );
    if ( action.err == null ) {
      state.publish.updated = [];
      localStorage.setItem(UPDATED_POINTS_LOCALSTORAGE_KEY, JSON.stringify(state.publish.updated));
    }
    break;
  }
  return state;
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
        point.set( 'updated', true );

        const attributes = cloneDeep( point.attributes );
        promise = point.fetch().then( res => point.save( attributes ) );
      } else {
        promise = point.save();
      }

      if ( coverBlob ) {
        point.setCover( coverBlob );
        promise.then(
          ( ) => point.attach( coverBlob, 'cover.png', 'image/png' )
        );
      }
      return { type, id: point.id, point: point.store() };
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
  return { type: RESCIND_POINT, id };
}

// # Reload Points
// Creates an action to replace all points in the store. This is useful to
// load the store with initial point data and to refresh the store when
// the user scrolls to a new area of the map.
export function reloadPoints() {
  const points = new PointCollection();
  return dispatch => {
    points.fetch().then( res => {
      return points.getCovers();
    } ).then( res => {
      dispatch( { type: RELOAD_POINTS, points: points.store() } );
    } );
  };
}

// # Reset Points
// Reset the points database then reload the (empty) database.
export function resetPoints() {
  return dispatch => reset().then( ( ) => dispatch( reloadPoints() ) );
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

// # Replicate Points
// Start a replication job from the remote points database.
export function replicatePoints() {
  return dispatch => {
    const time = new Date().toISOString();
    dispatch( { type: REQUEST_REPLICATION, time } );

    local.replicate.from( remote ).then( result => {
      dispatch( { type: RECEIVE_REPLICATION, time: result.end_time } );
      dispatch( reloadPoints() );
    } ).catch( err => {
      dispatch( { type: RECEIVE_REPLICATION, time: err.end_time } );
      dispatch( setSnackbar( { message: 'Unable to get points of interest from server' } ) );
    } );
  };
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
    this.interval = false;

    bindAll( this, 'update' );
  }

  select( state ) {
    return {
      isOnline: state.network.isOnline,
      repIvalM: state.settings.repIvalM || 10
    };
  }

  run() {
    const {store, select, update} = this;
    this.stop = observeStore( store, select, update );

    document.addEventListener( 'resume', update );
    update();
  }

  update() {
    const {isOnline, repIvalM} = this.select( this.store.getState() );

    clearTimeout( this.interval );
    if ( isOnline ) {
      this.store.dispatch( replicatePoints() );
      this.interval = setInterval(
        ( ) => this.store.dispatch( replicatePoints() ),
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
      return publish.getCovers();
    } ).then( res => {
      return buildFormData( publish.models );
    } ).then( formData => {
      return new Promise( ( resolve, reject ) => {
        const request = new XMLHttpRequest();
        request.open( 'POST', baseUrl + '/publish' );
        request.setRequestHeader('authorization', 'JWT ' + account.login.token);
        request.onload = event => {
          if ( request.status === 200 ) {
            resolve( request.statusText );
          } else {
            reject( request.statusText );
          }
        };
        request.onerror = event => {
          reject( request.statusText );
        };
        request.send( formData );
      } );
    } ).then( res => {
      dispatch( { type: RECEIVE_PUBLISH } );
      dispatch( setSnackbar( { message: 'Published points of interest' } ) );
    } ).catch( err => {
      dispatch( { type: RECEIVE_PUBLISH, err } );
      dispatch( setSnackbar( { message: 'Unable to publish points of interest to server' } ) );
    } );
  };
}

function buildFormData( models ) {
  const serialized = [];
  const covers = [];

  models.filter(
    model => [ Service, Alert, Comment ].some( ctr => model instanceof ctr )
  ).forEach(
    model => {
      const json = model.toJSON();
      if ( model.coverBlob ) {
        json.index = covers.length;
        covers.push( model.coverBlob );
      }
      serialized.push( json );
    }
  );
  const stringified = JSON.stringify( serialized );

  const formData = new FormData();
  formData.append( 'models', stringified );
  covers.forEach( cover => {
    formData.append( 'covers', cover, 'cover.png' );
  } );

  return formData;
}

/*global process*/
import notifications from './reducers/notifications';
import points from './reducers/points';
import tracks from './reducers/tracks';
import settings from './reducers/settings';
import { setShownOnboarding } from './reducers/settings';
import network from './reducers/network';
import map from './reducers/map';
import filters from './reducers/filter';
import account from './reducers/account';
import drawer from './reducers/btc-drawer';

import { fromJS } from 'immutable';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, autoRehydrate, createTransform } from 'redux-persist';
import thunk from 'redux-thunk';
import history from './history';

const devTools = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f;

const args = [ autoRehydrate(), applyMiddleware( thunk ) ];
if ( process.env.NODE_ENV === 'development' ) {
  args.push( devTools );
}

const theStore = compose.apply( null, args )( createStore )( combineReducers( {
  account,
  drawer,
  filters,
  map,
  network,
  notifications,
  points,
  settings,
tracks } ) );

// Convert the immutable data to normal JS with the immutable library.
function serializeMakeMutable( inboundState, key ) {
  return inboundState.toJS();
}

// Convert the normal JS to immatable data with the immutable library.
function deserializeMakeImmutable( outboundState, key ) {
  return (fromJS( outboundState ));
}

// The tracks reducer wraps its state in the immutable library's imutableness.
// We need to add these extra steps on serialize and deserialize.
let immutableTransformer = createTransform(
  ( inboundState, key ) => serializeMakeMutable( inboundState, key ),
  ( outboundState, key ) => deserializeMakeImmutable( outboundState, key ),
  { whitelist: [ 'tracks' ] }
);

/*
// Just print the key and state as it is serialized for debugging.
function serializePrint(inboundState, key) {
  console.log('Serializing ' + key + ':');
  console.log(inboundState);
  return inboundState;
}

// Just print the key and state as it is deserialized for debugging.
function deserializePrint(outboundState, key) {
  console.log('Deserializing ' + key + ':');
  console.log(outboundState);
  return outboundState;
}

// Just print the key and state as it is (de)serialized for debugging.
let debugPrintTransformer = createTransform(
  (inboundState, key) => serializePrint(inboundState, key),
  (outboundState, key) => deserializePrint(outboundState, key),
  // Whitelist which reducers you want to print.
  {whitelist: ['points']}
);
*/

// Don't persist the drawer state (basically the title on the nav bar).
persistStore( theStore, { transforms: [ immutableTransformer /*, debugPrintTransformer*/ ], blacklist: [ 'drawer', 'map', 'network', 'notifications', 'tracks' ] }, () => {
  // This is called once the store is loaded.
  if ( !theStore.getState().settings.shownOnboarding ) {
    theStore.dispatch( setShownOnboarding( true ) );
    history.push( '/onboarding' );
  }
} );

export default theStore;

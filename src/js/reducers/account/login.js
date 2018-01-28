import { Login } from 'btc-models';
import { request } from '../../util/server';

const REQUEST_LOGIN = 'btc-app/account/REQUEST_LOGIN';
const RECEIVE_LOGIN = 'btc-app/account/RECEIVE_LOGIN';
const FAILED_LOGIN_VALIDATION = 'btc-app/account/FAILED_LOGIN_VALIDATION';
const CLEAR_LOGIN_VALIDATION_AND_ERROR = 'btc-app/account/CLEAR_LOGIN_VALIDATION_AND_ERROR';
const LOGOUT = 'btc-app/account/LOGOUT';

const initState = {
  loggedIn: false,
  email: null,
  firstName: null,
  lastName: null,
  fetching: false, // true during login request
  received: false, // false until login response received
  token: null,
  validation: [],
  error: null
};

export default function reducer( state = initState, action ) {
  switch ( action.type ) {
  case REQUEST_LOGIN:
    return { ...state,
      loggedIn: false,
      email: action.email,
      fetching: true,
      validation: [],
      error: null
    };
  case RECEIVE_LOGIN:
    return { ...state,
      loggedIn: action.loggedIn,
      email: action.error ? null : state.email,
      firstName: action.error ? null : action.firstName,
      lastName: action.error ? null : action.lastName,
      fetching: false,
      token: action.token,
      roles: action.roles,
      validation: [],
      error: action.error || null
    };
  case FAILED_LOGIN_VALIDATION:
    return { ...state,
      loggedIn: false,
      email: null,
      fetching: false,
      validation: action.error || []
    };
  case CLEAR_LOGIN_VALIDATION_AND_ERROR:
    return { ...state,
      validation: [],
      error: null
    };
  case LOGOUT:
    return { ...initState };
  default:
    return state;
  }
}

// Asyncronous action creator that will ask the app server for an api
// token, given the user's email and password.
//
// When dispatched, the dispatch function will return a promise that
// resolves if login is successful and rejects otherwise.
export function login( attrs, success ) {
  // Short-circuit the request if there is a client side validation error
  const user = new Login( attrs, { validate: true } );
  if ( user.validationError ) {
    return errorInLogin( user.validationError );
  }

  return dispatch => {
    dispatch( requestLogin( attrs.email ) );

    return new Promise( ( resolve, reject ) => {
      request.post( '/authenticate' )
        .set( 'Content-Type', 'application/json' )
        .send( attrs )
        .end( ( error, response ) => {
          switch ( response.statusCode ) {
          case 200:
            resolve( { token: response.body.auth_token, firstName: response.body.first_name, lastName: response.body.last_name } );
            break;
          case 400:
          default:
            reject( response.body.unauthorized );
            break;
          }
        } );
    } ).then( infoDict => {
      dispatch( recieveLogin( infoDict.token, infoDict.firstName, infoDict.lastName ) );
      if ( success ) {
        success();
      }
    }, error => {
      dispatch( recieveLogin( null, null, null, error ) );
    } );
  };
}

// The action to create when there are client-side validation errors
function errorInLogin( error ) {
  return { type: FAILED_LOGIN_VALIDATION, error };
}

// Notify the store that a login request has begun
function requestLogin( email ) {
  return { type: REQUEST_LOGIN, email };
}

// Notify the store that a login request has completed, and pass in
// either the new credentials or the error message
function recieveLogin( token, firstName, lastName, error ) {
  const action = { type: RECEIVE_LOGIN, token, error };
  if ( error ) {
    action.loggedIn = false;
  } else {
    action.loggedIn = true;
    action.firstName = firstName;
    action.lastName = lastName;
  }
  return action;
}

// Clear stored validation and error state
export function clearLoginValidationAndError() {
  return { type: CLEAR_LOGIN_VALIDATION_AND_ERROR };
}

// Notify the store to log out the user
export function logout() {
  return { type: LOGOUT };
}

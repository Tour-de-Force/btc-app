import { User } from 'btc-models';
import { request } from '../../util/server';

const REQUEST_REGISTRATION = 'btc-app/account/REQUEST_REGISTRATION';
const RECEIVE_REGISTRATION = 'btc-app/account/RECEIVE_REGISTRATION';
const FAILED_REG_VALIDATION = 'btc-app/account/FAILED_REG_VALIDATION';
const CLEAR_REGISTRATION_VALIDATION_AND_ERROR = 'btc-app/account/CLEAR_REGISTRATION_VALIDATION_AND_ERROR';

const initState = {
  fetching: false, // true during registration request
  received: false, // false until registration response received
  validation: [],
  error: null
};

export default function reducer( state = initState, action ) {
  switch ( action.type ) {
  case REQUEST_REGISTRATION:
    return { ...state,
      fetching: true
    };
  case RECEIVE_REGISTRATION:
    return { ...state,
      fetching: false,
      received: true,
      validation: [],
      error: action.error || null
    };
  case FAILED_REG_VALIDATION:
    return { ...state,
      fetching: false,
      received: false,
      validation: action.error || []
    };
  case CLEAR_REGISTRATION_VALIDATION_AND_ERROR:
    return { ...state,
      validation: [],
      error: null
    };
  default:
    return state;
  }
}

// This action validates User attributes then sends a registration request
// to the api server.
export function register( attrs, success ) {
  // Short-circuit the request if there is a client side validation error
  const user = new User( attrs, { validate: true } );
  if ( user.validationError ) {
    return errorInRegistration( user.validationError );
  }
  if ( attrs.password != attrs.confirm_password ) {
    return errorInRegistration( [ { dataPath: '.confirm_password', message: 'passwords must match' } ] );
  }

  return dispatch => {
    dispatch( requestRegistration( attrs ) );

    const promise = new Promise( ( resolve, reject ) => {
      request.post( '/register' )
        .set( 'Content-Type', 'application/json' )
        .send( attrs )
        .end( ( error, response ) => {
          if ( typeof response == 'undefined' ) {
            reject( 'Unable to connect to the server.' );
          } else {
            switch ( response.statusCode ) {
            case 200:
              resolve();
              break;
            case 400:
            default:
              reject( response.body.error );
              break;
            }
          }
        } );
    } );

    promise.then( () => {
      dispatch( receiveRegistration() );
      if ( success ) success();
    }, error => {
      dispatch( receiveRegistration( error ) );
    } );

    return promise;
  };
}

// The action to create when we send the registration request to the server
function requestRegistration() {
  return { type: REQUEST_REGISTRATION };
}

// The action to create when there is a server error during registration
function receiveRegistration( error ) {
  return { type: RECEIVE_REGISTRATION, error };
}

// The action to create when there are client-side validation errors
function errorInRegistration( error ) {
  return { type: FAILED_REG_VALIDATION, error };
}

// Clear stored validation and error state
export function clearRegistrationValidationAndError() {
  return { type: CLEAR_REGISTRATION_VALIDATION_AND_ERROR };
}

import { Reset } from 'btc-models';
import { request } from '../../util/server';

const REQUEST_RESET_PASSWORD = 'btc-app/account/REQUEST_RESET_PASSWORD';
const RECEIVE_RESET_PASSWORD = 'btc-app/account/RECEIVE_RESET_PASSWORD';
const FAILED_RESET_PASSWORD_VALIDATION = 'btc-app/account/FAILED_RESET_PASSWORD_VALIDATION';
const CLEAR_RESET_VALIDATION_AND_ERROR = 'btc-app/account/CLEAR_RESET_VALIDATION_AND_ERROR';

const initState = {
  fetching: false, // true during reset password request
  received: false, // false until reset password response received
  validation: [],
  error: null
};

export default function reducer( state = initState, action ) {
  switch ( action.type ) {
  case REQUEST_RESET_PASSWORD:
    return { ...state,
      fetching: true
    };
  case RECEIVE_RESET_PASSWORD:
    return { ...state,
      fetching: false,
      received: true,
      validation: [],
      error: action.error || null
    };
  case FAILED_RESET_PASSWORD_VALIDATION:
    return { ...state,
      fetching: false,
      received: false,
      validation: action.error || []
    };
  case CLEAR_RESET_VALIDATION_AND_ERROR:
    return { ...state,
      validation: [],
      error: null
    };
  default:
    return state;
  }
}

// This action validates User attributes then sends a reset password request
// to the api server.
export function resetPassword( attrs, success ) {
  // Short-circuit the request if there is a client side validation error
  const user = new Reset( attrs, { validate: true } );
  if ( user.validationError ) {
    return errorInResetPassword( user.validationError );
  }
  if ( attrs.password != attrs.confirm_password ) {
    return errorInResetPassword( [ { dataPath: '.confirm_password', message: 'passwords must match' } ] );
  }

  return dispatch => {
    dispatch( requestResetPassword( attrs ) );

    const promise = new Promise( ( resolve, reject ) => {
      request.post( '/resetPassword' )
        .set( 'Content-Type', 'application/json' )
        .send( attrs )
        .end( ( error, response ) => {
          switch ( response.statusCode ) {
          case 200:
            resolve();
            break;
          case 400:
          default:
            reject( response.body.error );
            break;
          }
        } );
    } );

    promise.then( () => {
      dispatch( receiveResetPassword() );
      if ( success ) success();
    }, error => {
      dispatch( receiveResetPassword( error ) );
    } );

    return promise;
  };
}

// The action to create when we send the reset password request to the server
function requestResetPassword() {
  return { type: REQUEST_RESET_PASSWORD };
}

// The action to create when there is a server error during reset password
function receiveResetPassword( error ) {
  return { type: RECEIVE_RESET_PASSWORD, error };
}

// The action to create when there are client-side validation errors
function errorInResetPassword( error ) {
  return { type: FAILED_RESET_PASSWORD_VALIDATION, error };
}

// Clear stored validation and error state
export function clearResetValidationAndError() {
  return { type: CLEAR_RESET_VALIDATION_AND_ERROR };
}

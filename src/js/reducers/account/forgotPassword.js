import { Forgot } from 'btc-models';
import { request } from '../../util/server';

const REQUEST_FORGOT_PASSWORD = 'btc-app/account/REQUEST_FORGOT_PASSWORD';
const RECEIVE_FORGOT_PASSWORD = 'btc-app/account/RECEIVE_FORGOT_PASSWORD';
const FAILED_FORGOT_PASSWORD_VALIDATION = 'btc-app/account/FAILED_FORGOT_PASSWORD_VALIDATION';
const CLEAR_FORGOT_VALIDATION_AND_ERROR = 'btc-app/account/CLEAR_FORGOT_VALIDATION_AND_ERROR';

const initState = {
  fetching: false, // true during forgot password request
  received: false, // false until forgot password response received
  validation: [],
  error: null
};

export default function reducer( state = initState, action ) {
  switch ( action.type ) {
  case REQUEST_FORGOT_PASSWORD:
    return { ...state,
      fetching: true
    };
  case RECEIVE_FORGOT_PASSWORD:
    return { ...state,
      fetching: false,
      received: true,
      validation: [],
      error: action.error || null
    };
  case FAILED_FORGOT_PASSWORD_VALIDATION:
    return { ...state,
      fetching: false,
      received: false,
      validation: action.error || []
    };
  case CLEAR_FORGOT_VALIDATION_AND_ERROR:
    return { ...state,
      validation: [],
      error: null
    };
  default:
    return state;
  }
}

// This action validates User attributes then sends a forgot password request
// to the api server.
export function forgotPassword( attrs, success ) {
  // Short-circuit the request if there is a client side validation error
  const user = new Forgot( attrs, { validate: true } );
  if ( user.validationError ) {
    return errorInForgotPassword( user.validationError );
  }

  return dispatch => {
    dispatch( requestForgotPassword( attrs ) );

    const promise = new Promise( ( resolve, reject ) => {
      request.post( '/forgotPassword' )
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
      dispatch( receiveForgotPassword() );
      if ( success ) success();
    }, error => {
      dispatch( receiveForgotPassword( error ) );
    } );

    return promise;
  };
}

// The action to create when we send the forgot password request to the server
function requestForgotPassword() {
  return { type: REQUEST_FORGOT_PASSWORD };
}

// The action to create when there is a server error during forgot password
function receiveForgotPassword( error ) {
  return { type: RECEIVE_FORGOT_PASSWORD, error };
}

// The action to create when there are client-side validation errors
function errorInForgotPassword( error ) {
  return { type: FAILED_FORGOT_PASSWORD_VALIDATION, error };
}

// Clear stored validation and error state
export function clearForgotValidationAndError() {
  return { type: CLEAR_FORGOT_VALIDATION_AND_ERROR };
}

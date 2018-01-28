export const SET_SNACKBAR = 'btc-app/dialog/SET_SNACKBAR';
export const CLOSE_SNACKBAR = 'btc-app/dialog/CLOSE_SNACKBAR';

const initState = {
  message: '',
  open: false,
  autoHideDuration: 4000
};

export default function dialog( state = initState, action ) {
  switch ( action.type ) {
  case SET_SNACKBAR:
    return { ...state, ...action.dialog, open: true };
  case CLOSE_SNACKBAR:
    return { ...initState };
  default:
    return state;
  }
}

export function setSnackbar( dialog, timeout ) {
  if ( timeout ) {
    return dispatch => {
      setTimeout( () => {
        dispatch( setSnackbar( dialog ) );
      }, timeout );
    };
  } else {
    return { type: SET_SNACKBAR, dialog };
  }
}

export function closeSnackbar() {
  return { type: CLOSE_SNACKBAR };
}

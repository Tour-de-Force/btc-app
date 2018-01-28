const SET_FILTERS = 'btc-app/filter/SET_FILTERS';

const initState = {
  activeFilters: [],
  openServices: false,
  hideAlert: false
};

export default function filters( state = initState, action ) {
  switch ( action.type ) {
  case SET_FILTERS:
    return { ...state,
      activeFilters: [ ...action.filters.activeFilters ],
      openServices: action.filters.openServices,
      hideAlert: action.filters.hideAlert
    };
  default:
    return state;
  }
}

export function setFilters( filters ) {
  return { type: SET_FILTERS, filters };
}

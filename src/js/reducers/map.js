export const SET_MAP_CENTER = 'btc-app/map/SET_MAP_CENTER';
export const SET_MAP_ZOOM = 'btc-app/map/SET_MAP_ZOOM';
export const SET_MAP_LOADING = 'btc-app/map/SET_MAP_LOADING';
export const SET_GEO_LOCATION = 'btc-app/map/SET_GEO_LOCATION';
export const SET_FIT_BOUNDING_BOX = 'btc-app/map/SET_FIT_BOUNDING_BOX';

const USMap = { center: [ 39.8145, -99.9946 ], zoom: 3 };

export default function map( state = { loading: true, center: USMap.center, zoom: USMap.zoom, fitBoundingBox: null }, action ) {
  switch ( action.type ) {
  case SET_MAP_CENTER:
    return { ...state, center: action.center };
  case SET_MAP_ZOOM:
    return { ...state, zoom: action.zoom };
  case SET_MAP_LOADING:
    return { ...state, loading: action.loading };
  case SET_GEO_LOCATION:
    return { ...state, geolocation: action.geolocation };
  case SET_FIT_BOUNDING_BOX:
    return { ...state, fitBoundingBox: action.fitBoundingBox };
  default:
    return state;
  }
}

export function setMapCenter( center ) {
  return { type: SET_MAP_CENTER, center };
}

export function setMapZoom( zoom ) {
  return { type: SET_MAP_ZOOM, zoom };
}

export function setMapLoading( loading ) {
  return { type: SET_MAP_LOADING, loading };
}

export function setGeoLocation( geolocation ) {
  return { type: SET_GEO_LOCATION, geolocation };
}

export function setFitBoundingBox( fitBoundingBox ) {
  return { type: SET_FIT_BOUNDING_BOX, fitBoundingBox };
}

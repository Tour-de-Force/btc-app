
export const ADD_POINT = 'ADD_POINT';
export function addPoint(point) {
  return {
    type: ADD_POINT,
    point
  };
}

export const RESCIND_POINT = 'DELETE_POINT';
export function deletePoint(id) {
  return {
    type: DELETE_POINT,
    id
  };
}

export const UPDATE_POINT = 'UPDATE_POINT';
export function updatePoint(id, point) {
  return {
    type: UPDATE_POINT,
    id,
    point
  };
}

export const REPLICATE_POINT = 'REPLICATE_POINT';
export function replicatePoint(id, point) {
  return {
    type: REPLICATE_POINT,
    id,
    point
  };
}

export const RELOAD_POINTS = 'RESET_POINTS';
export function resetPoints(points) {
  return {
    type: RESET_POINTS,
    points
  };
}

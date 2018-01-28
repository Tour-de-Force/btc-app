import { isEqual } from 'lodash';

export class Agent {
  run() {
    console.error( 'Agent#run() is abstract' );
  }
}

export function observeStore( store, select, callback ) {
  let cache = select( store.getState() );
  return store.subscribe( () => {
    const update = select( store.getState() );
    if ( !isEqual( cache, update ) ) {
      cache = update;
      callback();
    }
  } );
}

/*eslint-disable no-unused-vars*/
import React, { Component, PropTypes } from 'react';
import { FloatingActionButton, FontIcon } from 'material-ui';

import Leaflet from 'leaflet';
import * as ReactLeaflet from 'react-leaflet';
/*eslint-enable no-unused-vars*/

import history from '../history';


// MapButtons takes in props for buttons, in which buttons should be an array of
// button objects, like so:
/*
  [{onTouchTap: goToFilter, icon:'filter'}, {onTouchTap: goToList, icon:'list'}]
*/
export class MapButtons extends Component {
  myLocation() {
    navigator.geolocation.getCurrentPosition(
      ( pos ) => {
        const {latitude, longitude} = pos.coords;
        const coords = [ latitude, longitude ]; // eslint-disable-line no-unused-vars
      //Future logic for my location once Map Box is implemented
      },
      ( err ) => {
        alert( 'Please turn on location services to find your location' );
        console.error( err );
      },
      {
        timeout: 5000
      }
    );
  }
  render() {
    const buttons = this.props.buttons.map( ( button, index ) => {
      if ( button.method != null ) {
        return (
          <FloatingActionButton key={ button.method }
            mini={ true }
            className='mapButtons'
            style={ { position: 'fixed', top: `${82 + 55 * index}px`, right: '10px' } }
            onTouchTap={ () => this.myLocation() }>
            <FontIcon className='material-icons'>
              { button.icon }
            </FontIcon>
          </FloatingActionButton>
          );
      } else {
        return (
          <FloatingActionButton key={ button.page }
            mini={ true }
            className='mapButtons'
            style={ { position: 'fixed', top: `${82 + 55 * index}px`, right: '10px' } }
            onTouchTap={ () => history.push( button.page ) }>
            <FontIcon className='material-icons'>
              { button.icon }
            </FontIcon>
          </FloatingActionButton>
          );
      }
    } );
    return (
      <span>{ buttons }</span>
      );
  }
}

MapButtons.defaultProps = {

};

export default MapButtons;

/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';

import ConnectedPointMap from '../../containers/connected-point-map';
/*eslint-enable no-unused-vars*/

import WizardPage from './wizard-page';
import { bindAll } from 'lodash';

import '../../../css/map.css';

// # Point Location Page
// The user must specify a location for both services and alerts. (However,
// you cannot update a service's location). When the user starts to add an
// alert or service, the center of the map should be used as the new point's
// initial location, which may be modified by dragging the map below a
// 'bobbing' marker.
//
// As the user drags the map underneath the bobbing marker, we grab the new
// location from a leaflet event.
export class PointLocation extends WizardPage {
  constructor( props ) {
    super( props );
    bindAll( this, 'updateLocation' );
  }

  getPageFields() {
    return [ 'location' ];
  }

  updateLocation( leaflet ) {
    const {lat, lng} = leaflet.target.getCenter();

    this.setState( { location: [ lat, lng ] } );
  }

  componentWillMount() {
    const {map} = this.props;

    this.setState( { location: map.center } );
  }

  componentDidMount() {
    this.props.setDrawer( 'Pick a Location' );
  }

  // The parent div has no styling as both children are absolutely positioned
  getPageContent() {
    var markerClass = 'crosshairs__marker';
    if ( this.props.isAlert ) {
      markerClass = 'crosshairs__marker_alert';
    }
    return (
      <div>
        <ConnectedPointMap addPoint
          className='map map--wizard-mode'
          afterMoved={ this.updateLocation } />
        <div className='crosshairs'>
          <div className='crosshairs__shadow' />
          <div className={ markerClass } />
        </div>
      </div>
      );
  }

  getPreferredTransition() {
    return WizardPage.transitions.next;
  }
}

export default PointLocation;

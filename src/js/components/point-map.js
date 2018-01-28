/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { CircularProgress } from 'material-ui';

import Leaflet from 'leaflet';
import * as ReactLeaflet from 'react-leaflet';
const {Marker, Popup, Map, TileLayer, CircleMarker, MultiPolyline, Icon} = ReactLeaflet;

import MBTilesLayer from './mbtiles-layer';
/*eslint-enable no-unused-vars*/

import { values, bindAll, noop } from 'lodash';
import { Point } from 'btc-models';

import '../../../node_modules/leaflet/dist/leaflet.css';
import '../../css/map.css';

export class PointMap extends Component {
  constructor( props ) {
    super( props );
    const {map} = this.props;
    this.state = {
      startCenter: map.center,
      center: map.center,
      zoom: map.zoom
    };
    bindAll( this, 'onMapMoved' );
  }

  componentDidMount() {
    const {map, setGeoLocation, setMapCenter, setMapLoading, setMapZoom} = this.props;

    //path to the leaflet images folder
    Leaflet.Icon.Default.imagePath = 'img/icons/';

    if ( map.loading ) {
      navigator.geolocation.getCurrentPosition(
        ( pos ) => {
          const {latitude, longitude} = pos.coords;
          const coords = [ latitude, longitude ];
          setGeoLocation( coords );
          setMapCenter( coords );
          setMapZoom( 13 );
          this.setState( {
            startCenter: coords,
            center: coords,
            zoom: 13
          } );
          setMapLoading( false );
        },
        ( err ) => {
          console.error( err );
          setMapLoading( false );
        },
        {
          timeout: 5000
        }
      );
    }
  }

  componentWillUnmount() {
    const {setMapZoom, setMapCenter} = this.props;
    setMapZoom( this.state.zoom );
    setMapCenter( this.state.center );
  }

  componentWillReceiveProps( nextProps ) {
    const {map} = nextProps;
    this.setState( {
      startCenter: map.center
    } );
  }

  shouldComponentUpdate( nextProps, nextState ) {
    return ( this.props.map.loading !== nextProps.map.loading ) ||
      ( this.state.startCenter !== nextState.startCenter ) ||
      ( this.state.startCenter !== nextProps.map.center ) ||
      ( this.props.points.length !== nextProps.points.length );
  }

  onMapMoved( leaflet ) {
    const {lat, lng} = leaflet.target.getCenter();
    this.setState( {
      zoom: leaflet.target.getZoom(),
      center: [ lat, lng ]
    },
      this.props.afterMoved.bind( this, leaflet )
    );
  }

  render() {
    const {points, tracks, settings, map, deselectMarker, selectMarker, filters, children, setFitBoundingBox} = this.props;

    let markers = points.filter( point => {
      if ( point.isFetching ) {
        return false;
      }
      if ( Point.uri( point._id ).type === 'alert' && filters.hideAlert ) {
        return false;
      }
      if ( filters.activeFilters.length == 0 ) {
        return true;
      }

      return filters.activeFilters.some( filterElement => {
        // join the service amenities with the service type
        let serviceTypes = ( point.amenities || [] ).concat( point.type );
        if ( serviceTypes.indexOf( filterElement ) !== -1 ) {
          return true;
        }
      } );
    } ).map( point => {
      // TODO: Don't even include the onClick listener if we're in addPoint mode
      const onClick = () => {
        if ( !this.props.addPoint ) {
          selectMarker( point );
        }
      };
      if ( Point.uri( point._id ).type === 'alert' ) {
        var alertIcon = Leaflet.icon( {
          iconUrl: 'img/icons/alert-icon.png',
          shadowUrl: 'img/icons/marker-shadow.png',

          iconSize: [ 25, 38 ], // size of the icon
          shadowSize: [ 41, 41 ], // size of the shadow
          iconAnchor: [ 14, 38 ], // point of the icon which will correspond to marker's location
          shadowAnchor: [ 15, 41 ], // the same for the shadow
          popupAnchor: [ 0, 0 ] // point from which the popup should open relative to the iconAnchor
        } );
        return (
          <Marker key={ point._id }
            radius={ 10 }
            position={ point.location }
            onclick={ onClick }
            icon={ alertIcon } />
          );
      } else {
        return (
          <Marker key={ point._id }
            radius={ 10 }
            position={ point.location }
            onclick={ onClick } />
          );
      }
    } );

    // Display waypoints for active tracks
    const activeTracks = values( tracks ).filter( track => track.active );
    const trackViews = activeTracks.map( track => {
      return (
        <MultiPolyline key={ track._id }
          polylines={ track.waypoints }
          color='#f30'
          opacity='0.8' />
        );
    } );

    // If offline, display tile layers for tracks with available packages
    const availableTracks = values( tracks )
      .filter( track => track.status === 'available' );

    const tileLayerInfo = {
      url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=5d65d56b7a4646a5af842d8beb7d3cff',
      attr: 'See about page for map copyright.'
    };

    // In online mode, use tiles from OpenStreetMap. When offline, display
    // tiles from the first availble mbtiles package. If no tile packages
    // are availale when offline, display no tile layers.
    // TODO: display multiple offline tile layers concurrently
    let tileLayer;
    if ( settings.onlineMode ) {
      tileLayer = (
        <TileLayer url={ tileLayerInfo.url }
          attribution={ tileLayerInfo.attr } />
      );
    } else if ( availableTracks.length > 0 ) {
      const pkg = availableTracks[ 0 ].pkg;
      tileLayer = (
        <MBTilesLayer pkg={ pkg }
          url={ tileLayerInfo.url }
          attribution={ tileLayerInfo.attr } />
      );
    }

    let circleMarker = '';
    if ( map.geolocation ) {
      circleMarker = <CircleMarker center={ map.geolocation } />;
    }

    let view;
    if ( map.loading ) {
      view = (
        <div style={ { margin: 'auto' } }>
          <CircularProgress size={ 2 } />
        </div>
      );
    } else if ( map.fitBoundingBox ) {
      view = (
        <Map className={ this.props.className || 'map' }
          bounds={ map.fitBoundingBox }
          onMove={ this.props.onLeafletMove }
          onMoveend={ this.onMapMoved }
          onClick={ this.props.addPoint ? noop : deselectMarker }>
          { circleMarker }
          { tileLayer }
          { markers }
          { trackViews }
          { children }
        </Map>
      );
      setFitBoundingBox( null );
    } else {
      view = (
        <Map className={ this.props.className || 'map' }
          center={ this.state.startCenter }
          zoom={ this.state.zoom }
          onMove={ this.props.onLeafletMove }
          onMoveend={ this.onMapMoved }
          onClick={ this.props.addPoint ? noop : deselectMarker }>
          { circleMarker }
          { tileLayer }
          { markers }
          { trackViews }
          { children }
        </Map>
      );
    }

    return view;
  }
}

PointMap.defaultProps = {
  onLeafletMove: noop,
  afterMoved: noop,
  addPoint: false
};

export default PointMap;

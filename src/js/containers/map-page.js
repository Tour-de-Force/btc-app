/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { Paper } from 'material-ui';

import PointMap from '../components/point-map';
import ConnectedPointMap from './connected-point-map';
import VectorMap from './vector-map';
import MapButtons from '../components/map-buttons';
import { login } from '../reducers/account/login';
/*eslint-enable no-unused-vars*/

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { setDrawer } from '../reducers/btc-drawer';
import { loadPoint, flagPoint, updateService } from '../reducers/points';
import { getCoverPhotoURLForPointId } from '../reducers/points';

import history from '../history';

import '../../css/layout.css';
import '../../css/map.css';

// The MapPage displays the browsable map and point cards.
//
// It connects to a slice of state required to render both the map and
// point cards, if necessary. We expect the React Router to provide us at most
// a single child. If it exists, the child will be the point card.
class MapPage extends Component {
  componentDidMount() {
    this.props.pageActions.setDrawer( 'Map' );
  }

  // Navigating to the index route (the MapPage) deslects any marker
  static deselectMarker() {
    history.push( '/' );
  }

  // Navigate to the path with `prefix` specific to the provided marker.
  // This is used by MapPage and its child PointCard to open PointCards in
  // various states (peek, view, rate).
  static navigateWithId( prefix, point ) {
    const encodedId = encodeURIComponent( point._id );
    history.push( `/${prefix}/${encodedId}` );
  }

  // Clone the child PointCard with relevant state and props.
  //
  // If the MapPage is supplied a PointCard, then clone that PointCard with
  // all the actions, functions, and state slices it might need.
  // The cardActions are bound to dispatch by the connect call at the end of
  // this file.
  //
  // This function will throw an error if there is more than one child.
  mapPropsOnCard() {
    if ( !this.props.children ) return;
    const {points, coverPhotoUrls, login} = this.props;

    const cardState = { points, coverPhotoUrls, login, heightOffset: 0 };
    const cardFunctions = {
      deselectMarker: MapPage.deselectMarker,
      navigateWithId: MapPage.navigateWithId
    };

    const card = React.Children.only( this.props.children );
    return React.cloneElement( card, {
      ...this.props.cardActions,
      ...cardState,
      ...cardFunctions
    } );
  }

  // Display the map in browse mode with any child PointCard on top.
  // See map.css and point-card.css to learn how the elements are displayed.
  render() {
    const buttons = [ /*{
      page: 'list',
      icon: 'list'
    },*/ {
      page: 'filter',
      icon: 'filter_list'
    }, {
      method: 'centerMap',
      icon: 'my_location'
    } ];
    const props = {
      deselectMarker: MapPage.deselectMarker,
      selectMarker: point => MapPage.navigateWithId( 'peek-point', point )
    };
    return (
      <div className="layout__section__fullflex">
        <VectorMap className="map map--browse-mode" { ...props } { ...this.props.pointMap } {...this.props.pointMapActions}/>
        <MapButtons buttons={ buttons }
          history={ history }
          { ...this.props.MapButtons} />
        { this.mapPropsOnCard() }
      </div>
      );
  }
}

function mapStateToProps( state ) {
  return {
    points: state.points.points, // PointCards are built for this marker
    coverPhotoUrls: state.points.coverPhotoUrls,
    login: state.account.login,
    MapButtons: {
      map: state.map,
      filters: state.filters
    }
  };
}

// Separates bound action creators into two keys
//  - cardActions: for those bound action creators to pass to the PointCard.
//    They are passed directly to the cloned PointCard
//  - pageActions: for those bound action creators to use within MapPage
function mapDispatchToProps( dispatch ) {
  return {
    cardActions: bindActionCreators( {
      'loadPoint': loadPoint, // Cards load markers on componentDidMount,
      'flagPoint': flagPoint,
      'updateService': updateService,
      'getCoverPhotoURLForPointId': getCoverPhotoURLForPointId
    }, dispatch ),
    pageActions: bindActionCreators( {
      'setDrawer': setDrawer
    }, dispatch )
  };
}

export default connect( mapStateToProps, mapDispatchToProps )( MapPage );

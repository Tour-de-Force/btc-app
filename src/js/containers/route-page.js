/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { RaisedButton, FontIcon, Card, CardHeader, CardMedia, CardTitle, CardActions, CardText, LinearProgress } from 'material-ui';
import DeviceStorage from '../components/device-storage';
import { Page } from '../components/page';

import { connect } from 'react-redux';
import { isFinite } from 'underscore';
import history from '../history';

import { setDrawer } from '../reducers/btc-drawer';
import { fetchTrack, clearTrack, activateTrack, deactivateTrack } from '../reducers/tracks';
import { setMapZoom, setMapCenter, setFitBoundingBox } from '../reducers/map';
/*eslint-enable no-unused-vars*/



class RoutePage extends Component {
  componentDidMount() {
    this.props.dispatch( setDrawer( 'USBRS Routes' ) );
  }
  /*
    onSaveTrack( id, pkg ) {
      this.props.dispatch( fetchTrack( id, pkg ) );
    }

    onCancelTrack( id ) {
      console.log( 'FIXME: `onCancelTrack`' );
    }

    onRemoveTrack( id ) {
      this.props.dispatch( clearTrack( id ) );
    }

    onActivationTrack( id, val ) {
      const fn = val ? activateTrack : deactivateTrack;
      this.props.dispatch( fn( id ) );
    }*/


  jumpToTrackLocation( trackBoundingBox ) {
    this.props.dispatch( setFitBoundingBox( trackBoundingBox ) );
    history.push( '/' );
  }

  render() {
    const {tracks} = this.props;
    // eslint-disable-next-line no-unused-vars
    const downloaded = Object.keys( tracks ).reduce( ( pre, cur ) => {
      return pre + ( tracks[ cur ].status === 'fetched' );
    }, 0 );

    const rows = Object.keys( tracks ).map( id => {
      const track = tracks[ id ];

      /*eslint-disable no-unused-vars*/
      let progressBar;
      /*eslint-enable no-unused-vars*/
      /*if ( track.isFetching === true ) {
        progressBar = (
          <LinearProgress indeterminate={ true } />
        );
      } else if ( isFinite( track.isFetching ) ) {
        progressBar = (
          <LinearProgress progress={ track.isFetching * 100 } />
        );
      }*/

      /*TODO: Refactor this using O-O principles
      let downloadButtonText;
      let isSave;
      let action;
      if ( track.isFetching ) {
        downloadButtonText = 'Cancel';
        isSave = false;
        action = this.onCancelTrack.bind( this, id );
      } else if ( track.status === 'available' ) {
        downloadButtonText = 'Remove';
        isSave = false;
        action = this.onRemoveTrack.bind( this, id );
      } else {
        downloadButtonText = 'Save';
        isSave = true;
        action = this.onSaveTrack.bind( this, id, track.pkg );
      }*/

      /* onTouchTap={  } */
      /* secondary={ track.active } */
      /* this.onActivationTrack.bind( this, id, !track.active)  */
      /* subtitle={ `${track.sizeMiB} MiB` } */
      /* <img src='./img/usbr20.png' /> */

      return (
        <Card key={ id }
          style={ { margin: 40 } }>
          <CardMedia overlay={ <CardTitle title={ track.name }
                                 subtitle="United States Bicycle Route" /> }>
            <img src={ `./img/${track._id}.png` } />
          </CardMedia>
          <CardText>
            { track.description }
          </CardText>
          <CardActions>
            <RaisedButton id={ id }
              label='Show Route'
              onTouchTap={ this.jumpToTrackLocation.bind( this, track.boundingBox ) }
              icon={ <FontIcon className='material-icons'>visibility</FontIcon> } />
          </CardActions>
        </Card>
        );
    } );


    return (
      <Page className="layout__section">
        { rows }
      </Page>
      );
  } //end render
}

const select = state => {
  return { tracks: state.tracks.toJS() };
};
/* ( select ) */
export default connect( select )( RoutePage );

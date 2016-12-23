/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { Paper, FontIcon, RaisedButton } from 'material-ui';
import ClearIcon from 'material-ui/svg-icons/content/clear';

import { Page } from '../components/page';

import PointList from '../components/point-list';
/*eslint-enable no-unused-vars*/

import { publishPoints, rescindPoint } from '../reducers/points';
import { setDrawer } from '../reducers/btc-drawer';
import history from '../history';

import { connect } from 'react-redux';
import { bindAll } from 'lodash';

class PublishPage extends Component {
  componentDidMount() {
    this.props.setDrawer( 'Publish' );
    bindAll( this, 'onPublish', 'onPointClick', 'onPointRemove' );
  }

  onPointClick( point ) {
    history.push( `/view-point/${encodeURIComponent( point._id )}` );
  }

  onPointRemove( point ) {
    this.props.rescindPoint(point._id);
  }

  onPublish() {
    this.props.publishPoints();
  }

  render() {
    const clear = (
    <ClearIcon style={ { fontSize: 'inherit', margin: '0px 0.1em' } }
      color='red' />
    );

    const instructionsStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '10px'
    };

    const buttonStyle = {
      width: '50%',
      margin: '5px 10px 0px 5px'
    };

    const instructions = ( this.props.points.length === 0 ? 
    <div style={ instructionsStyle }>
      There are no alerts or services ready to publish.
    </div> : <div></div>
	/*<div style={ instructionsStyle }>
      Click on { clear } to delete a point.
    </div>*/
    );

    return (
      <Page className="layout__section">
        <Paper>
          <PointList instructions={ instructions }
            points={ this.props.points }
            /*buttonIcon='clear'
            buttonAction={ this.onPointRemove.bind( this ) }*/
            clickAction={ this.onPointClick.bind( this ) } />
          <div style={ instructionsStyle }>
            <RaisedButton style={ buttonStyle }
              disabled={ this.props.points.length === 0 }
              onTouchTap={ this.onPublish }
              label="Publish"
              primary={ true } />
          </div>
        </Paper>
      </Page>
      );
  }
}

function mapStateToProps( state ) {
  return {
    points: state.points.publish.updated.map( id => state.points.points[ id ] )
  };
}

const mapDispatchToProps = { publishPoints, rescindPoint, setDrawer };

export default connect( mapStateToProps, mapDispatchToProps )( PublishPage );

/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { Paper, RaisedButton, FontIcon } from 'material-ui';

import PointList from '../components/point-list';
/*eslint-enable no-unused-vars*/

import { selectMarker } from '../actions/map-actions';
import { connect } from 'react-redux';

class ListPage extends Component {
  componentDidMount() {
    this.props.setDrawer( 'List of Services' );
  }

  onPointClick( point ) {
    this.props.dispatch( selectMarker( point ) );
    this.props.history.push( `/view-point/${encodeURIComponent(point._id)}` );
  }

  render() {
    const mapIcon = (
      <FontIcon
        className="material-icons">
          map
      </FontIcon>
    );

    const filterIcon = (
      <FontIcon
        className="material-icons">
          filter_list
      </FontIcon>
    );

    const buttonStyles = [
      {
        width: 'calc(50% - 15px)',
        margin: '10px 5px 0px 10px'
      },
      {
        width: 'calc(50% - 15px)',
        margin: '5px 10px 0px 5px'
      }
    ];

    return (
      <div className="page-content">

        <RaisedButton
          style={buttonStyles[0]}
          label="Map"
          labelPosition="after"
          primary={true}
          icon={mapIcon}
          onClick={()=>{this.props.history.push('/');}}
        />

        <RaisedButton
          style={buttonStyles[1]}
          label="Filter"
          labelPosition="after"
          primary={true}
          icon={filterIcon}
          onClick={()=>{this.props.history.push('filter');}}
        />

        <PointList points={this.props.services} onPointClick={this.onPointClick.bind(this)}/>
      </div>
    );
  }
}

function select( state ) {
  return {
    services: state.points
  };
}

export default connect( select )( ListPage );
/*eslint-disable no-unused-vars*/
import React, { Component, PropTypes } from 'react';
import { List, ListItem, IconButton, FontIcon, Divider, Avatar } from 'material-ui';
/*eslint-enable no-unused-vars*/

import { getCoverPhotoURLForPointId } from '../reducers/points';

import { display } from 'btc-models';

import { connect } from 'react-redux';

export class PointList extends Component {
  componentWillReceiveProps( nextProps ) {
    if ( nextProps.getCoverPhotoURLForPointId ) {
      nextProps.points.forEach( function( point ) {
        // Load all the photos in if they are not yet loaded.
        nextProps.getCoverPhotoURLForPointId( point._id );
      } );
    }
  }

  render() {
    const points = this.props.points.map( point => {
      const listProps = {};
      if ( this.props.buttonIcon && this.props.buttonAction ) {
        listProps.rightIconButton = (
          <IconButton onTouchTap={ this.props.buttonAction.bind( this, point ) }>
            <FontIcon className="material-icons"
              style={ { fontSize: '36px' } }
              color="red">
              { this.props.buttonIcon }
            </FontIcon>
          </IconButton>
        );
      }

      if ( this.props.coverPhotoUrls[ point._id ] ) {
        listProps.leftAvatar = <Avatar src={ this.props.coverPhotoUrls[ point._id ] } />;
      }

      return (
        <div key={ point._id }>
          <ListItem style={ { margin: '10px' } }
            onTouchTap={ this.props.clickAction.bind( this, point ) }
            primaryText={ point.name }
            secondaryText={ display( point.type ) }
            { ...listProps } />
          <Divider/>
        </div>
        );
    } );

    return (
      <div>
        { this.props.instructions }
        <List>
          { points }
        </List>
      </div>
      );
  }
}

function mapStateToProps( state ) {
  return {
  };
}

const mapDispatchToProps = { getCoverPhotoURLForPointId };

export default connect( mapStateToProps, mapDispatchToProps )( PointList );

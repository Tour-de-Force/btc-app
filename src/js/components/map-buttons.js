/*eslint-disable no-unused-vars*/
import React, { Component, PropTypes } from 'react';
import { FloatingActionButton, FontIcon } from 'material-ui';
/*eslint-enable no-unused-vars*/

import history from '../history';

// MapButtons takes in props for buttons, in which buttons should be an array of
// button objects, like so:
/*
  [{onTouchTap: goToFilter, icon:'filter'}, {onTouchTap: goToList, icon:'list'}]
*/
export class MapButtons extends Component {
  render() {
    const buttons = this.props.buttons.map( ( button, index ) => {
      if ( button.method != null) { //TODO: Do this a better way, rather than reloading the page.
        return (
          <FloatingActionButton key={ button.method }
            mini={ true }
            className="mapButtons"
            style={ { position: 'fixed', top: `${82 + 55 * index}px`, right: '10px' } }
            onTouchTap={ ( ) => window.location.reload() }>
            <FontIcon className="material-icons">
              { button.icon }
            </FontIcon>
          </FloatingActionButton>
        );
      }
      else {
        return (
          <FloatingActionButton key={ button.page }
            mini={ true }
            className="mapButtons"
            style={ { position: 'fixed', top: `${82 + 55 * index}px`, right: '10px' } }
            onTouchTap={ ( ) => history.push( button.page ) }>
            <FontIcon className="material-icons">
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

export default MapButtons;

/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { FontIcon } from 'material-ui';
/*eslint-enable no-unused-vars*/

export class RatingSelector extends Component {
  constructor( props ) {
    super( props );
    this.state = { rating: props.rating };
  }

  onSetRating( starIndex ) {
    if ( !this.props.disabled ) {
      this.setState( { rating: starIndex } );
    }
  }

  getValue() {
    return this.state.rating;
  }

  render() {
    const stars = [ 1, 2, 3, 4, 5 ].map( star => {
      let icon = 'star_border';
      if ( this.state.rating >= star ) {
        icon = 'star';
      } else if ( ( this.state.rating - star ) === 0.5 ) {
        icon = 'star_half';
      }
      return (<FontIcon style={ this.props.style }
                key={ star }
                className='material-icons'
                onTouchTap={ () => this.onSetRating( star ) }>
                { icon }
              </FontIcon>);
    } );

    return (<div style={ { display: 'inline-flex' } }>
              { stars }
            </div>);
  }
}

RatingSelector.defaultProps = {
  rating: 0
};

export default RatingSelector;

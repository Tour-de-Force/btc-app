/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { CardText, FlatButton } from 'material-ui';

import PointCard from './point-card';
import HoursTable from '../hours-table';
/*eslint-enable no-unused-vars*/

export class ViewPointCard extends PointCard {
  getCardState() {
    return 'point-card--view';
  }

  getCardAction() {
    const {peekMarker} = this.props;
    return <FlatButton label="See Less"
             onClick={ peekMarker } />;
  }

  getCardContent() {
    const {point} = this.props;

    let content;
    if ( this.type === 'alert' ) {
      content = (
        <div className="point-card__content">
          <CardText>
            { point.description }
          </CardText>
        </div>
      );
    } else if ( this.type === 'service' ) {
      let hours = <HoursTable hours={ point.schedule.default } />;
      let explanation;
      if( point.seasonal ) {
        explanation = (
          <CardText>
            These hours are seasonal. Call or check online for more information.
          </CardText>
        );
      }

      let website;
      if ( point.website ) {
        website = (
          <span>Website: <a href={ point.website }> { point.website } </a></span>
        );
      }

      let phone;
      if ( point.phone ) {
        phone = (
          <span>Phone: { point.phone }</span>
        );
      }

      content = (
        <div className="point-card__content">
          <CardText>
            <span className="point-card__open-until">{ PointCard.openUntil( point ) + ' — ' }</span>
            <span>{ point.description }</span>
          </CardText>
          <CardText>
            { PointCard.amenities( point ) }
          </CardText>
          <CardText className="point-card__contact">
            { phone }
            { website }
          </CardText>
          { hours }
          { explanation }
        </div>
      );
    }

    return content;
  }
}

export default ViewPointCard;
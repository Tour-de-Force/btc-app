/*eslint-disable no-unused-vars*/
import React from 'react';
import { CardText, RaisedButton, FlatButton } from 'material-ui';

import PointCard from './point-card';
/*eslint-enable no-unused-vars*/

import { Point } from 'btc-models';

export class PeekPointCard extends PointCard {
  getCardState() {
    return 'point-card--peek';
  }

  getCardAction() {
    return <RaisedButton label="See More"
             onTouchTap={ this.navigate( 'view-point' ) } />;
  }

  getCardContent() {
    const point = this.point;
    const {type} = Point.uri( point._id );

    let timezone = '';
    // Check that this has a schedule property before trying
    // to access things in it (alerts don't have a schedule, but services do).
    if ( point.schedule && point.schedule.default && point.schedule.default[ 0 ] ) {
      timezone = '(' + point.schedule.default[ 0 ].timezone + ')';
    }

    let openUntil;
    let averageRatings;

    if ( type === 'service' ) {
      averageRatings = (<span>{ this.getAverageStarRating( point.comments ) }</span>
      );
      openUntil = (
        <span className="point-card__open-until">{ `${PointCard.openUntil( point )} ${timezone} — ` }</span>
      );
    }

    let expiresOn;
    if ( type === 'alert' ) {
      expiresOn = (<span className="point-card__expires-on">{ `${PointCard.expiresOn( point )}` }</span>
      );
    }
    return (
      <CardText className="point-card__description">
        { averageRatings }
        { openUntil }
        <span>{ point.description }</span>
        <br/>
        { expiresOn }
      </CardText>
      );
  }
}

export default PeekPointCard;

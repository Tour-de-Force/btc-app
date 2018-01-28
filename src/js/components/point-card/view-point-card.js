/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { CardText, RaisedButton, FlatButton } from 'material-ui';

import PointCard from './point-card';
import HoursTable from '../hours-table';
/*eslint-enable no-unused-vars*/

import { Point } from 'btc-models';

export class ViewPointCard extends PointCard {
  getCardState() {
    return 'point-card--view';
  }

  getCardAction() {
    return <RaisedButton label="See Less"
             onTouchTap={ this.navigate( 'peek-point' ) } />;
  }

  getCardContent() {
    const point = this.point;
    const {type} = Point.uri( point._id );

    let content;
    if ( type === 'alert' ) {
      content = (
        <div className="point-card__content">
          <CardText>
            { point.description }
            <br/>
            <span className="point-card__expires-on">{ `${PointCard.expiresOn( point )}` }</span>
          </CardText>
        </div>
      );
    } else if ( type === 'service' ) {
      let hours = <HoursTable hours={ point.schedule.default } />;
      let explanation;
      if ( point.seasonal ) {
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

      let contact;
      if ( website || phone ) {
        contact = (
          <CardText className="point-card__contact">
            { phone }
            { website }
          </CardText>
        );
      }

      let timezone = '';
      // Check that this has a schedule property before trying
      // to access things in it (alerts don't have a schedule, but services do).
      if ( point.schedule && point.schedule.default && point.schedule.default[ 0 ] ) {
        timezone = '(' + point.schedule.default[ 0 ].timezone + ')';
      }

      content = (
        <div className="point-card__content">
          <CardText>
            <span>{ this.getAverageStarRating( point.comments ) }</span>
            <span className="point-card__open-until">{ `${PointCard.openUntil( point )} ${timezone} — ` }</span>
            <span>{ point.description }</span>
          </CardText>
          <CardText>
            { PointCard.amenities( point ) }
          </CardText>
          { contact }
          { hours }
          { explanation }
        </div>
      );
    }

    return content;
  }
}

export default ViewPointCard;

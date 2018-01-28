/*eslint-disable no-unused-vars*/
import React from 'react';
import { Card, CardActions, CardText, RaisedButton, FlatButton, Paper, TextField, List, ListItem } from 'material-ui';

import PointCard from './point-card';
import { FormBlock } from '../block';
import RatingSelector from '../rating-selector';
/*eslint-enable no-unused-vars*/

import { bindAll, cloneDeep } from 'lodash';
import history from '../../history';

import uuid from 'uuid';
import { Service } from 'btc-models';

export class RatingPointCard extends PointCard {
  constructor( props ) {
    super( props );
    bindAll( this, 'onComment' );
    this.errorMessage = '';
  }

  getCardState() {
    return 'point-card--rate';
  }

  getCardAction() {
    const goBack = history.goBack.bind( history );
    return <RaisedButton label='Go Back'
             onTouchTap={ goBack } />;
  }

  onCommentUpdate( event ) {
    const {setComment} = this.props;
    const comment = event.target.value;
    setComment( comment );
  }

  getCardContent() {
    return (
      <div className='point-card__content'>
        { this.getCommentEntry() }
        { this.getCommentList() }
      </div>
      );
  }

  getCommentList() {
    const comments = this.point.comments.map( comment => {
      const style = { fontSize: '16px' };
      const stars = (
      <RatingSelector disabled
        rating={ comment.rating }
        style={ style } />
      );
      const date = this.formatDateTimeString( comment.date );

      return (
        <ListItem key={ comment.uuid }
          primaryText={ comment.user }
          secondaryTextLines={ comment.text ? 2 : 1 }
          secondaryText={ (
            <span>{ stars } { date } <br /> { comment.text }</span>
          ) } />
        );
    } );

    return (
      <List>
        { comments }
      </List>
      );
  }

  onComment( values ) {
    const {updateService} = this.props;
    let usersName = this.props.login.firstName + ' ' + this.props.login.lastName.slice( 0, 1 ) + '.';
    const comment = {
      user: usersName,
      date: new Date().toISOString(),
      text: values.comment,
      rating: values.rating,
      uuid: uuid.v1()
    };
    if ( this.props.login.loggedIn == true ) {
      var newPoint = cloneDeep( this.point );
      newPoint.comments.push( comment );

      const service = new Service( newPoint );
      service.update();
      if ( service.isValid() ) {
        this.errorMessage = '';
        updateService( service );
      } else {
        this.errorMessage = 'Enter a comment between 1 and 140 characters and select a rating between 1 and 5 stars.';
        // Re-render to show the error message.
        this.forceUpdate();
      }
    } else {
      history.push( 'login' );
    }
  }

  getCommentEntry() {
    // See the FormBlock class in block.js for how this tree works.
    const fields = [ {
      rowClassName: 'comment-entry',
      row: [ {
        name: 'comment',
        hint: 'Your comment',
        className: 'comment-entry__comment'
      }, {
        name: 'rating',
        element: <RatingSelector />,
        className: 'comment-entry__rating'
      } ]
    } ];
    return (
      <FormBlock onAction={ this.onComment }
        thinActionButton
        zDepth={ 0 }
        actionText='Submit'
        fields={ fields }
        problemText={ this.errorMessage } />
      );
  }

  // TODO: refactor this!
  formatDateTimeString( dateTimeString ) {
    const dateParts = dateTimeString.slice( 0, 10 ).split( '-' );
    return [ dateParts[ 1 ], dateParts[ 2 ], dateParts[ 0 ] ].join( '/' );
  }
}

export default RatingPointCard;

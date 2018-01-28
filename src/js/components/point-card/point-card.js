/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { Card, CardActions, CardText, FlatButton, RaisedButton, CardMedia, CardTitle, CardHeader, IconButton, IconMenu, MenuItem, CircularProgress, ListItem } from 'material-ui';
import LocationIcon from 'material-ui/svg-icons/maps/place';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { setSnackbar } from '../../reducers/notifications';

import RatingSelector from '../rating-selector';
/*eslint-enable no-unused-vars*/

import { Point, Schedule, display } from 'btc-models';
import '../../../css/point-card.css';

import history from '../../history';
import { isEmpty } from 'lodash';

// The PointCard is the base class for all the states of a point card. These
// include the peek, rate, and view cards.
//
// The base class is responsible for rendering the card, the header, actions,
// and media. The subclasses may implement `getCardContent` to supply anything
// else.
//
// When a card mounts or updates, the card is responsible for dispatching the
// action to load the marker indicated within the React Router params.
export class PointCard extends Component {
  // Return content do display in the card
  getCardContent() {
    return (
      <CardText className="point-card__description">
        { this.props.point.description }
      </CardText>
      );
  }

  // Return a BEM state class to append to the Card's className
  getCardState() {
    console.error( 'PointCard#getCardState() is abstract' );
  }

  // # componentWillMount
  // Right before we render, check if the point we're trying to load is already
  // in the store. If it's not, we need to load the point in
  // componentDidMount. Until that happens, the render method needs to know
  // the point is fetching.
  componentWillMount() {
    const {params, points} = this.props;
    this.point = points[ params.id ] || { isFetching: true };
  }

  // # componentDidMount
  // The router passes point cards the id of the point to display in `params`.
  // When the component mounts, we need to ensure that point is present in
  // the store, so we dispatch `loadPoint`. However, `loadPoint` is not
  // guaranteed to fetch the point synchronously. If the point is not found
  // immediately, `this.point` will have { isFetching: true } so we can delay
  // rendering the real card.
  //
  // Generally, you are not supposed to put data fetching calls in this
  // method, but `loadPoint` synchronously puts some default data into
  // points[ params.id ] that we need *before* render.
  componentDidMount() {
    // eslint-disable-next-line no-unused-vars
    const {params, points, login, loadPoint, getCoverPhotoURLForPointId} = this.props;
    loadPoint( params.id );
    this.point = points[ params.id ];
    getCoverPhotoURLForPointId( params.id );
  }

  // # componentWillReceiveProps
  // See componentDidMount. As we are potentially getting a new id to display
  // from the router, we need to load the point for that id.
  componentWillReceiveProps( nextProps ) {
    // eslint-disable-next-line no-unused-vars
    const {params, points, login, loadPoint, getCoverPhotoURLForPointId} = nextProps;
    loadPoint( params.id );
    this.point = points[ params.id ];
    getCoverPhotoURLForPointId( params.id );
  }

  // Return a function that navigates to a different page with the loaded
  // point's id as the parameter.
  navigate( prefix ) {
    const {navigateWithId} = this.props;
    const point = this.point;
    return () => navigateWithId( prefix, point );
  }

  navigateNoId( prefix ) {
    return () => history.push( prefix );
  }

  static openUntil( service ) {
    const schedule = new Schedule( service.schedule );
    if ( schedule.hasAnyHoursAdded() ) {
      // There are some hours added.
      const closing = schedule.getClosingToday();
      if ( closing ) {
        const time = new Date( schedule.getClosingToday() )
          .toLocaleTimeString( [], { hour: 'numeric', minutes: 'numeric ' } );
        return 'Open until: ' + time;
      } else {
        return 'Not open today';
      }
    } else {
      // There are no hours added.
      return 'Hours not available';
    }
  }
  /* This method gets the expiration date and displays the date if there is one.
   * Else it will display "no expiration date added."
   */
  static expiresOn( alert ) {
    var ex_date = new Date( alert.expiration_date );
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if ( alert.expiration_date != null ) {
      // Get that expiration date and display that expiration date
      return 'Expires On: ' + ex_date.toLocaleDateString( navigator.language, options );
    //else return no exipration date added
    } else {
      return 'No expiration date added ';
    }
  }

  /* This method will calculate the average start ratings */
  getAverageStarRating( comments ) {
    let numberOfPeopleRating = comments.length;
    var totalStars = 0;

    if ( numberOfPeopleRating == 0 ) {
      return (
        <div>
          <RaisedButton onTouchTap={ this.navigate( 'rate-point' ) }
            label="Be the first to rate this point!" />
          <br/>
          <br/>
          <br/>
        </div>

        //primaryText={ "Be the first to rate!"} /></div>
        ); // EARLY RETURN (not yet rated)
    }

    //loop over the comments to get the length of the array (aka how mant ratings are there).
    for ( var i = 0; i < comments.length; i++ ) {
      // add the total stars
      totalStars += comments[ i ].rating;
    }

    var averageStars = 0;
    //calculating the average star ratings.
    averageStars = ( totalStars * 1.0 ) / numberOfPeopleRating;
    //Round to get the nearest int
    averageStars = Math.round( averageStars );


    const style = { fontSize: '16px' };
    const average = (
    <RatingSelector disabled
      rating={ averageStars }
      style={ style } />
    );

    return (
      <div>
        <RaisedButton onTouchTap={ this.navigate( 'rate-point' ) }
          label="View Ratings"
          labelPosition="before">
          { average }
        </RaisedButton>
        <br/>
        <br/>
        <br/>
      </div>
      );

  }

  // Get an english list of available amenities
  static amenities( service ) {
    const {amenities} = service;
    if ( !isEmpty( amenities ) ) {
      let amenities_and = [ ...amenities.map( display ) ];

      let seperator;
      if ( amenities.length > 2 ) { // 1, 2, and 3
        amenities_and.push( 'and ' + amenities_and.pop() );
        seperator = ', ';
      } else if ( amenities.length > 1 ) { // 1 and 2
        amenities_and.push( 'and ' + amenities_and.pop() );
        seperator = ' ';
      } else {
        seperator = '';
      }

      return 'Amenities include: ' + amenities_and.join( seperator );
    } else {
      return 'Amenities: none listed';
    }
  }

  // The IconMenu at the top right of the card, in the header. It allows the
  // user to:
  //  - update a point's infomation
  //  - rate and comment on a point
  //  - flag the point
  getIconMenu() {
    const point = this.point;
    const {type} = Point.uri( point._id );

    let update, rate, flag;


    if ( type === 'service' ) {
      if ( this.props.login.loggedIn == true ) {
        update = (
          <MenuItem primaryText='Update Information'
            onTouchTap={ this.navigate( 'loading' ) } />
        );
        rate = (
          <MenuItem primaryText='Rate Service'
            onTouchTap={ this.navigate( 'rate-point' ) } />
        );
        flag = (
          <MenuItem primaryText='Flag'
            onTouchTap={ this.navigate( 'flag-point' ) } />
        );
      } else {
        update = (
          <MenuItem primaryText='Update Information'
            onTouchTap={ this.navigateNoId( 'login' ) } />
        );
        rate = (
          <MenuItem primaryText='Rate Service'
            onTouchTap={ this.navigateNoId( 'login' ) } />
        );
        flag = (
          <MenuItem primaryText='Flag'
            onTouchTap={ this.navigateNoId( 'login' ) } />
        );
      }
    } else {
      if ( this.props.login.loggedIn == true ) {
        flag = (
          <MenuItem primaryText='Flag'
            onTouchTap={ this.navigate( 'flag-point' ) } />
        );
      } else {
        flag = (
          <MenuItem primaryText='Flag'
            onTouchTap={ this.navigateNoId( 'login' ) } />
        );
      }
    }

    const button = (
    <IconButton>
      <MoreVertIcon />
    </IconButton>
    );

    return (
      <IconMenu className="point-card__icon-menu"
        iconButtonElement={ button }
        anchorOrigin={ { horizontal: 'right', vertical: 'top' } }
        targetOrigin={ { horizontal: 'right', vertical: 'top' } }>
        { update }
        { rate }
        { flag }
      </IconMenu>
      );
  }

  // Display the card if the point is loaded. If not, show a spinner.
  render() {
    const {deselectMarker} = this.props;
    const point = this.point;

    const state = this.getCardState();
    const className = 'point-card' + ( state ? ( ' ' + state ) : '' );

    if ( point.isFetching ) {
      return (
        <Card className={ className }>
          <CircularProgress className="point-card__spinner"
            size={ 2 } />
        </Card>
        );
    }

    let coverPhotoUrl = this.props.coverPhotoUrls[ this.point._id ];
    let coverPhotoStyle = {};
    if ( coverPhotoUrl ) {
      coverPhotoStyle.backgroundImage = `url(${coverPhotoUrl})`;
    }

    return (
      <Card className={ className }>
        <CardHeader className="point-card__header"
          title={ point.name }
          subtitle={ display( point.type ) }
          avatar={ <LocationIcon className="point-card__avatar" /> }>
          { this.getIconMenu() }
        </CardHeader>
        <div className="point-card__scroll">
          <CardMedia className="point-card__media"
            style={ coverPhotoStyle } />
          { this.getCardContent() }
        </div>
        <CardActions className="point-card__actions">
          { this.getCardAction() }
          <RaisedButton label="Close"
            onTouchTap={ deselectMarker } />
        </CardActions>
      </Card>
      );
  }
}

export default PointCard;

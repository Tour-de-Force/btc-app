/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { RaisedButton, FlatButton, CardText, FontIcon, MenuItem, SelectField } from 'material-ui';
import ClearIcon from 'material-ui/svg-icons/content/clear';
/*eslint-disable no-unused-vars*/

import WizardPage from './wizard-page';
import { display } from 'btc-models';

import { keys, bindAll, union, without, toPairs } from 'lodash';

export class ServiceAmenities extends WizardPage {
  constructor( props ) {
    super( props );
    bindAll( this, 'addAmenity', 'removeAmenity' );
  }

  componentWillMount() {
    const {point} = this.props;
    this.setState( {
      amenities: point.amenities,
      amenity: null
    } );
  }

  componentDidMount() {
    this.props.setDrawer( 'Add Amenities' );
  }

  getPageFields() {
    return [ 'amenities' ];
  }

  addAmenity() {
    const amenities = union( this.state.amenities, [ this.state.amenity ] );
    this.setState( { amenities } );
  }

  removeAmenity( amenity ) {
    const amenities = without( this.state.amenities, amenity );
    this.setState( { amenities } );
  }

  getPageContent() {
    const {types} = this.props;
    const options = toPairs( types ).map( ( [type, values] ) => (
      <MenuItem key={ type }
        value={ type }
        primaryText={ values.display } />
    ) );
    const amenities = this.state.amenities.map( amenity => (
      <RaisedButton key={ amenity }
        label={ display( amenity ) }
        onTouchTap={ this.removeAmenity.bind( this, amenity ) }
        icon={ <ClearIcon /> }
        style={ { margin: 8 } }
        labelPosition="before" />
    ) );
    return (
      <div className="wizard-page">
        <SelectField fullWidth
          { ...this.link( 'amenity' ) }
          menuStyle={ { maxWidth: 500 } }
          floatingLabelText="Choose an amenity">
          { options }
        </SelectField>
        <div>
          { amenities }
        </div>
      </div>
      );
  }

  getPageSecondaryActions() {
    return (
      <div>
        <RaisedButton label="Add amenity"
          disabled={ !this.state.amenity }
          onTouchTap={ this.addAmenity } />
      </div>
      );
  }

  getPreferredTransition() {
    return WizardPage.transitions.submit;
  }
}

export default ServiceAmenities;

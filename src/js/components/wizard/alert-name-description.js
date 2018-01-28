/*eslint-disable no-unused-vars*/
import React from 'react';
import { TextField, RaisedButton, FlatButton, SelectField, MenuItem, DatePicker } from 'material-ui';
/*eslint-enable no-unused-vars*/

import WizardPage from './wizard-page';

import { toPairs } from 'lodash';

export class AlertNameDescription extends WizardPage {
  componentWillMount() {
    const {point} = this.props;

    this.setState( {
      name: point.name,
      type: point.type,
      location: point.location,
      expiration_date: point.expiration_date,
      description: point.description
    } );
  }

  componentDidMount() {
    this.props.setDrawer( 'Enter Information' ) ;
  }

  getPageFields() {
    return [ 'name', 'type', 'description', 'expiration_date', 'coverBlob' ];
  }

  getPageContent() {
    const [lat, lng] = this.state.location;
    const latlng = `(${ lat.toFixed( 4 ) }, ${ lng.toFixed( 4 ) })`;

    const {types} = this.props;
    const options = toPairs( types ).map( ( [type, values] ) => (
      <MenuItem key={ type }
        value={ type }
        primaryText={ values.display } />
    ) );

    let {validationErrors} = this.props;
    if ( !validationErrors ) {
      validationErrors = {};
    }
    //create new date variable
    var tomorrow = new Date();
    //add 1 day to the date Object to set the minDate to be tomorrow and not today.
    tomorrow.setDate( tomorrow.getDate() + 1 );

    return (
      <div className="wizard-page">
        <TextField fullWidth
          { ...this.link( 'name' ) }
          floatingLabelText="Name"
          errorText={ validationErrors[ 'name' ] ? validationErrors[ 'name' ].message : '' } />
        <TextField disabled
          fullWidth
          value={ latlng }
          floatingLabelText="Location"
          errorText={ validationErrors[ 'location' ] ? validationErrors[ 'location' ].message : '' } />
        <SelectField fullWidth
          { ...this.link( 'type' ) }
          menuStyle={ { maxWidth: 500 } }
          floatingLabelText="Alert type"
          errorText={ validationErrors[ 'type' ] ? validationErrors[ 'type' ].message : '' }>
          { options }
        </SelectField>
        <TextField fullWidth
          { ...this.link( 'description' ) }
          floatingLabelText="Description"
          multiLine
          rows={ 2 }
          rowsMax={ 4 }
          errorText={ validationErrors[ 'description' ] ? validationErrors[ 'description' ].message : '' } />
        <DatePicker fullWidth
          { ...this.link( 'expiration_date' ) }
          minDate={ tomorrow }
          floatingLabelText="Expires"
          autoOk={ true }
          firstDayOfWeek={ 0 }
          errorText={ validationErrors[ 'expiration_date' ] ? validationErrors[ 'expiration_date' ].message : '' } />
      </div>
      );
  }

  getPageSecondaryActions() {
    return (
    this.getPhotoButton()
    );
  }

  getPreferredTransition() {
    const {name, type} = this.state;

    if ( name && type ) {
      return WizardPage.transitions.next;
    } else {
      return WizardPage.transitions.disabled;
    }
  }
}

export default AlertNameDescription;

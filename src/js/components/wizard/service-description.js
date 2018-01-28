/*eslint-disable no-unused-vars*/
import React from 'react';
import { RaisedButton, FlatButton, TextField } from 'material-ui';
/*eslint-enable no-unused-vars*/

import { isEmpty } from 'lodash';
import WizardPage from './wizard-page';

export class ServiceDescription extends WizardPage {
  componentWillMount() {
    const {point} = this.props;
    this.setState( {
      description: point.description,
      phone: point.phone,
      address: point.address,
      website: point.website
    } );
  }

  componentDidMount() {
    this.props.setDrawer( 'Add Details' );
  }

  getPageFields() {
    return [
      'description',
      'phone',
      'address',
      'website',
      'coverBlob'
    ];
  }

  getPageContent() {
    let {validationErrors} = this.props;
    if ( !validationErrors ) {
      validationErrors = {};
    }

    return (
      <div className="wizard-page">
        <TextField fullWidth
          { ...this.link( 'phone' ) }
          floatingLabelText="Phone Number"
          type="tel"
          errorText={ validationErrors[ 'phone' ] ? validationErrors[ 'phone' ].message : '' } />
        <TextField fullWidth
          { ...this.link( 'address' ) }
          floatingLabelText="Address"
          errorText={ validationErrors[ 'address' ] ? validationErrors[ 'address' ].message : '' } />
        <TextField fullWidth
          { ...this.link( 'website' ) }
          floatingLabelText="Website"
          type="url"
          errorText={ validationErrors[ 'website' ] ? validationErrors[ 'website' ].message : '' } />
        <TextField fullWidth
          { ...this.link( 'description' ) }
          floatingLabelText="Description"
          multiLine={ true }
          rows={ 2 }
          rowsMax={ 4 }
          errorText={ validationErrors[ 'description' ] ? validationErrors[ 'description' ].message : '' } />
      </div>
      );
  }

  getPageSecondaryActions() {
    return (
    this.getPhotoButton()
    );
  }

  getPreferredTransition() {
    const anySet = this.getPageFields().reduce( ( anySet, field ) => {
      return anySet || !isEmpty( this.state[ field ] );
    }, false );

    if ( anySet || this.state.coverBlob ) {
      return WizardPage.transitions.next;
    } else {
      return WizardPage.transitions.skip;
    }
  }
}

export default ServiceDescription;

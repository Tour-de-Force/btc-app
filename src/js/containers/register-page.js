/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { LetterheadPage } from '../components/page';
import { FormBlock, errorProps } from '../components/block';
/*eslint-enable no-unused-vars*/

import { connect } from 'react-redux';
import bindAll from 'lodash/bindAll';

import history from '../history';

import { register, clearRegistrationValidationAndError } from '../reducers/account';
import { setDrawer } from '../reducers/btc-drawer';

const fields = [ {
  hint: 'Email',
  name: 'email'
}, {
  hint: 'Password',
  name: 'password'
}, {
  hint: 'Confirm Password',
  name: 'confirm_password'
}, {
  hint: 'First name',
  name: 'first'
}, {
  hint: 'Last name',
  name: 'last'
} ];

export class RegisterPage extends Component {
  constructor( props ) {
    super( props );
    bindAll( this, 'onRegister' );
  }

  componentDidMount() {
    this.props.dispatch( setDrawer( 'Register' ) );
    this.props.dispatch( clearRegistrationValidationAndError() );
  }

  // The FormBlock will call `onRegister` with `values` as an object containing
  // field, field value pairs.
  //
  // If registration is successful, redirect the user to a "thank you" page
  onRegister( values ) {
    const {dispatch} = this.props;
    dispatch( register( values, () => history.push( '/thanks' ) ) );
  }

  render() {
    const {account} = this.props;
    const {error, validation} = account.registration;

    return (
      <LetterheadPage className="layout__section">
        <FormBlock onAction={ this.onRegister }
          header="Sign up for a Bicycle Touring Companion account"
          { ...errorProps( error, validation ) }
          actionText='Sign up'
          fields={ fields } />
      </LetterheadPage>
      );
  }
}

function select( state ) {
  return {
    account: state.account
  };
}
export default connect( select )( RegisterPage );

/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { LetterheadPage } from '../components/page';
import { FormBlock, errorProps } from '../components/block';
/*eslint-enable no-unused-vars*/

import { connect } from 'react-redux';
import bindAll from 'lodash/bindAll';

import history from '../history';

import { forgotPassword, clearForgotValidationAndError } from '../reducers/account';
import { setDrawer } from '../reducers/btc-drawer';

const fields = [ {
  hint: 'Email',
  name: 'email'
} ];

export class ForgotPasswordPage extends Component {
  constructor( props ) {
    super( props );
    bindAll( this, 'onForgotPassword' );
  }

  componentDidMount() {
    this.props.dispatch( setDrawer( 'Forgot Password' ) );
    this.props.dispatch( clearForgotValidationAndError() );
  }

  // The FormBlock will call `onForgotPassword` with `values` as an object containing
  // field, field value pairs.
  //
  // If password reset is successful, redirect the user to a "thank you" page
  onForgotPassword( values ) {
    const {dispatch} = this.props;
    dispatch( forgotPassword( values, () => history.push( '/thanks-forgot-password' ) ) );
  }

  render() {
    const {account} = this.props;
    const {error, validation} = account.forgotPassword;

    return (
      <LetterheadPage className="layout__section">
        <FormBlock onAction={ this.onForgotPassword }
          header="Enter the email associated with the account"
          { ...errorProps( error, validation ) }
          actionText='Send Link'
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
export default connect( select )( ForgotPasswordPage );

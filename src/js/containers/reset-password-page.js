/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { LetterheadPage } from '../components/page';
import { FormBlock, errorProps } from '../components/block';
/*eslint-enable no-unused-vars*/

import { connect } from 'react-redux';
import bindAll from 'lodash/bindAll';

import history from '../history';

import { resetPassword, clearResetValidationAndError } from '../reducers/account';
import { setDrawer } from '../reducers/btc-drawer';

const fields = [ {
  hint: 'Password',
  name: 'password'
}, {
  hint: 'Confirm Password',
  name: 'confirm_password'
} ];

export class ResetPasswordPage extends Component {
  constructor( props ) {
    super( props );
    bindAll( this, 'onResetPassword' );
  }

  componentDidMount() {
    this.props.dispatch( setDrawer( 'Password Reset' ) );
    this.props.dispatch( clearResetValidationAndError() );
  }

  // The FormBlock will call `onResetPassword` with `values` as an object containing
  // field, field value pairs.
  //
  // If reset is successful, redirect the user to a 'thank you' page
  onResetPassword( values ) {
    values[ 'verification' ] = encodeURIComponent( this.props.params.verification );
    const {dispatch} = this.props;
    dispatch( resetPassword( values, () => history.push( '/thanks-reset-password' ) ) );
  }

  render() {
    const {account} = this.props;
    const {error, validation} = account.resetPassword;

    return (
      <LetterheadPage className='layout__section'>
        <FormBlock onAction={ this.onResetPassword }
          header='Enter a new password'
          { ...errorProps( error, validation ) }
          actionText='Reset'
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
export default connect( select )( ResetPasswordPage );

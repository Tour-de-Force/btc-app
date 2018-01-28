/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { Link } from 'react-router';
import { LetterheadPage } from '../components/page';
import { FormBlock, Block, BlockFooter, errorProps } from '../components/block';
/*eslint-enable no-unused-vars*/

import { connect } from 'react-redux';
import bindAll from 'lodash/bindAll';

import history from '../history';

import { login, clearLoginValidationAndError } from '../reducers/account';
import { setDrawer } from '../reducers/btc-drawer';
import { setSnackbar } from '../reducers/notifications';

const fields = [ {
  name: 'email',
  hint: 'Email'
}, {
  name: 'password',
  hint: 'Password'
} ];

const footer = (
<BlockFooter>
  <span><Link to="register">Sign up</Link> for the app</span>
  <span><Link to="forgot-password">Forgot password?</Link></span>
</BlockFooter>
);

export class LoginPage extends Component {
  constructor( props ) {
    super( props );
    bindAll( this, 'onLogin' );
  }

  componentDidMount() {
    this.props.dispatch( setDrawer( 'Login' ) );
    this.props.dispatch( clearLoginValidationAndError() );
  }

  // The FormBlock will call `onLogin` with `values` as an object containing
  // field, field value pairs.
  //
  // If login is successful, redirect the user to the map and display a
  // snackbar message.
  onLogin( values ) {
    const {dispatch} = this.props;
    dispatch( login( values, () => {
      history.push( '/' );
      dispatch( setSnackbar( { message: 'You have logged in!' }, 500 ) );
    } ) );
  }

  render() {
    const {account} = this.props;
    const {error, validation} = account.login;

    return (
      <LetterheadPage className="layout__section">
        <FormBlock onAction={ this.onLogin }
          { ...errorProps( error, validation ) }
          actionText="Login"
          fields={ fields }
          footer={ footer } />
      </LetterheadPage>
      );
  }
}

function select( state ) {
  return {
    account: state.account
  };
}
export default connect( select )( LoginPage );

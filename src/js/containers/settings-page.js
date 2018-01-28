
/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { RaisedButton, CardText, List, ListItem, Toggle, Divider } from 'material-ui';

import { Page } from '../components/page';
import { Block } from '../components/block';
import { SettingSwitch } from '../components/setting-switch';

import Refresh from 'material-ui/svg-icons/navigation/refresh';
import Delete from 'material-ui/svg-icons/action/delete';
import DeleteForever from 'material-ui/svg-icons/action/delete-forever';
import Help from 'material-ui/svg-icons/action/help';
import AccountCircle from 'material-ui/svg-icons/action/account-circle';


import noop from 'lodash/noop';
/*eslint-enable no-unused-vars*/

import history from '../history';
import { resetPoints, replicatePoints } from '../reducers/points';
import { resetDatabaseAndLocalStorageAndRefresh } from '../database';
import { setOnlineMode } from '../reducers/settings';
import { connect } from 'react-redux';

import { setDrawer } from '../reducers/btc-drawer';

export class SettingsPage extends Component {
  componentDidMount() {
    this.props.setDrawer( 'Settings' );
  }

  launchPanels() {
    history.push( '/onboarding' );
  }

  render() {
    const {setOnlineMode, replicatePoints, resetPoints, settings} = this.props;

    const toggleItems = [ {
      text: 'Offline mode',
      subtext: 'Don\'t connect to the internet',
      toggled: !settings.onlineMode,
      onToggle: offline => setOnlineMode( !settings.onlineMode )
    } /*, {
      text: 'Download on mobile',
      subtext: 'Use 3G or 4G data',
      toggled: false,
      onToggle: noop
    }*/ ].map( item => {
      const tog = (
      <Toggle toggled={ item.toggled }
        onToggle={ item.onToggle } />
      );
      return (
        <ListItem key={ item.text }
          primaryText={ item.text }
          secondaryText={ item.subtext }
          rightToggle={ tog } />
        );
    } );

    var options = { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const date = 'Last: ' + new Date( this.props.lastReplicatedTimestamp ).toLocaleDateString( navigator.language, options );
    const lastUpdated = (
    <ListItem primaryText='Update points now'
      onTouchTap={ replicatePoints }
      secondaryText={ date }
      leftIcon={ <Refresh /> } />
    );

    const clearPoints = (
    <ListItem primaryText='Clear point cache'
      onTouchTap={ resetPoints }
      secondaryText='Including unpublished'
      leftIcon={ <Delete /> } />
    );

    const resetApp = (
    <ListItem primaryText='Reset app'
      onTouchTap={ resetDatabaseAndLocalStorageAndRefresh }
      secondaryText='Clear all data and restart'
      leftIcon={ <DeleteForever /> } />
    );

    const onboarding = (
    <ListItem primaryText='Launch help panels'
      onTouchTap={ this.launchPanels }
      secondaryText=''
      leftIcon={ <Help /> } />
    );

    const {loggedIn, email} = this.props.login;
    let account;
    if ( loggedIn ) {
      account = (
        <List>
          <ListItem disabled
            primaryText='Logged in as'
            secondaryText={ email }
            leftIcon={ <AccountCircle /> } />
        </List>
      );
    }

  /*esfmt-ignore-start*/
    return (
      <Page className='layout__section'>
        <Block style={ { padding: 0 } }>
          <List>
            { toggleItems }
          </List>
          <Divider />
          <List>
            { lastUpdated }
            { clearPoints }
            { resetApp }
            { onboarding }
          </List>
          <Divider />
          { account }
        </Block>
      </Page>
      );
      /*esfmt-ignore-end*/
  }
}

function mapStateToProps( state ) {
  return {
    settings: state.settings,
    login: state.account.login,
    lastReplicatedTimestamp: state.points.replication.time,
  };
}

const actions = { resetPoints, replicatePoints, setOnlineMode, setDrawer };

export default connect( mapStateToProps, actions )( SettingsPage );

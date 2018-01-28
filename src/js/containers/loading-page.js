/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { replicatePointsWithCallback } from '../reducers/points';

import { LetterheadPage } from '../components/page';
import { Block } from '../components/block';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import history from '../history';

export class LoadingPage extends Component {
  componentDidMount() {
    const {isOnline} = this.props.network;
    let handler = ( function( me ) {
      return function() {
        return history.push( `update-service/${ encodeURIComponent( me.props.params.id ) }` );
      };
    }( this ) );
    if ( isOnline ) {
      this.props.replicatePointsWithCallback( handler );
    } else {
      handler();
    }
  }

  render() {
    return (
      <LetterheadPage>
        <Block header='Loading most up-to-date service information...' />
      </LetterheadPage>
      );
  }

  static mapDispatchToProps( dispatch ) {
    return {
      ...bindActionCreators( {
        'replicatePointsWithCallback': replicatePointsWithCallback
      }, dispatch )
    };
  }

  static mapStateToProps( state ) {
    return {
      network: state.network
    };
  }
}

export default connect( LoadingPage.mapStateToProps, LoadingPage.mapDispatchToProps )( LoadingPage );

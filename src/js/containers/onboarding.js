/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import Pagination from 'react-js-pagination';

import { Page } from '../components/page';
import { Block } from '../components/block';
/*eslint-enable no-unused-vars*/

import { connect } from 'react-redux';

import { setDrawer } from '../reducers/btc-drawer';

import '../../css/onboarding.css';

export class OnboardingPage extends Component {
  constructor( props ) {
    super( props );
    // eslint-disable-next-line no-undef
    var data = require( '../../json/onboardingData.json' );
    this.totalItems = data.length;
    this.onboardingText = [];
    for ( var i = 0; i < data.length; i++ ) {
      var obj = data[ i ];
      this.onboardingText.push( obj.text );
    }

    this.state = {
      activePage: 1,
      text: ''
    };
  }

  componentDidMount() {
    this.props.setDrawer( '' );
  }

  handlePageChange( pageNumber ) {
    //console.log(`active page is ${pageNumber}`);
    this.setState( { activePage: pageNumber, text: this.onboardingText[ pageNumber - 1 ] } );
  }

  render() {
    var image = 'img/onboarding' + this.state.activePage + '.png';
    return (
      <div id='container'>
        <img id='panelImage'
          src={ image } />
        <div id='panelBottom'>
          <div id='panelText'>
            { this.state.text }
          </div>
          <div>
            <Pagination activePage={ this.state.activePage }
              itemsCountPerPage={ 1 }
              totalItemsCount={ this.totalItems }
              pageRangeDisplayed={ 5 }
              onChange={ this.handlePageChange.bind( this ) } />
          </div>
        </div>
      </div>
      );
  }
}

function mapStateToProps( state ) {
  return {};
}

const actions = { setDrawer };

export default connect( mapStateToProps, actions )( OnboardingPage );

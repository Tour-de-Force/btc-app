/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import Pagination from "react-js-pagination";

import { Page } from '../components/page';
import { Block } from '../components/block';
/*eslint-enable no-unused-vars*/

import { connect } from 'react-redux';

import { setDrawer } from '../reducers/btc-drawer';

export class OnboardingPage extends Component {
  constructor(props) {
      super(props);

      var data = require('../../json/onboardingData.json');
      this.totalItems = data.length;
      this.onboardingText = [];
      for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        this.onboardingText.push(obj.text);
      }

      this.state = {
        activePage: 1,
        text: ""
      };
  }

  handlePageChange(pageNumber) {
    //console.log(`active page is ${pageNumber}`);
    this.setState({activePage: pageNumber, text: this.onboardingText[pageNumber-1]});
  }

  render() {
    var image = 'img/onboarding'+ this.state.activePage + '.png';
    return (
      <div style={{height:'100%'}}>
        <img src={image} style={{zIndex:'1200', boxSizing:'border-box', outline:'solid 75px rgb(0, 188, 212)'}} />
        <p style={{
          zIndex:'1300', display: 'flex', alignItems:'center', justifyContent:'center',
          position:'fixed', bottom:'125px', backgroundColor:'rgb(0, 188, 212)', color:'white', textAlign:'center'
        }}>
        {this.state.text}
        </p>
        <div style={{zIndex:'1300', display: 'flex', alignItems:'center', justifyContent:'center', position:'fixed', bottom:'75px'}}>
          <Pagination
            activePage={this.state.activePage}
            itemsCountPerPage={1}
            totalItemsCount={this.totalItems}
            pageRangeDisplayed={5}
            onChange={this.handlePageChange.bind(this)}
          />
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

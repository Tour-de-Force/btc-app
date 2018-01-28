/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { keys, pick, assign, isFunction, bindAll, isEmpty } from 'lodash';
import { RaisedButton, FlatButton, Popover, Menu, MenuItem } from 'material-ui';
import PointCard from '../point-card/point-card';
import { connect } from 'react-redux';
import { imgSrcToBlob, createObjectURL, base64StringToBlob, dataURLToBlob } from 'blob-util';
import Device, { PhotoEncodingMethods } from '../../util/device';
/*eslint-enable no-unused-vars*/



import '../../../css/wizard.css';

// # Wizard Page
// The WizardPage is the base class for all the pages associated with a tab
// in the add point or update point flows.
//
// Wizard pages operate in succession. Completing one page brings you to the
// next. This transition may depend on the state of the current page. Each
// wizard page is given the ability to choose when it allows the user to
// move on to the next page.
//
// NOTE: **A WizardPage must not be rendered if its required data is not yet
// available.** The link function works off of the defaultValue prop, anything
// else is needlessly complex.
export class WizardPage extends Component {
  constructor( props ) {
    super( props );
    bindAll( this, 'link', 'onPhotoAdd', 'persistBefore' );

    this.state = {
      popoverOpen: false,
    };
  }

  // # getPageFields
  // Return an array of field names that will be picked out of `this.state`
  // for serialization.
  getPageFields() {
    return [];
  }

  // # getPageValues
  // Pick the values for fields in `getPageFields()` for serialization;
  getPageValues() {
    const object = assign( {}, pick( this.state, this.getPageFields() ) );
    for ( var property in object ) {
      if ( object.hasOwnProperty( property ) ) {
        if ( object[ property ] === '' ) {
          object[ property ] = undefined;
        }
      }
    }
    let keyValues = object;

    /* for each key if the key is an instanceof date the key value is now converted into a string */
    Object.keys( keyValues ).forEach( function( key ) {
      if ( keyValues[ key ] instanceof Date ) {
        keyValues[ key ] = keyValues[ key ].toISOString();
      }
    } );

    return keyValues;
  }

  // # getPageContent
  // Get the content to display in the wizard page. These should usually be
  // form fields. The content should be controlled, where fields are linked
  // with this.state.
  getPageContent() {
    console.error( 'WizardPage#getPageContent() is abstract' );
    return <div />;
  }

  // # getPageSecondaryActions
  // If the wizard page should have other buttons that don't really fit with
  // the flow of the other fields, you can put them in the same row as the
  // 'next' button.
  getPageSecondaryActions() {
    return;
  }

  // # getPreferredTransition
  // Return the preferred transition type, to modify the effect of the 'next'
  // button. This may be overriden.
  getPreferredTransition() {
    console.error( 'WizardPage#getPageContent() is abstract' );
    return WizardPage.transitions.disabled;
  }

  // # getTransition
  // Returns a transition type from WizardPage.transitions to modify the
  // effect of the 'next' button.
  //
  // This method takes in the wizard page
  // subclass' preference into account. However, we override the preference
  // when the wizard page is the last in the list of tabs, in which case
  // the action should always be submit.
  getTransition() {
    if ( this.props.finalTab ) {
      return WizardPage.transitions.submit;
    } else {
      return this.getPreferredTransition();
    }
  }

  // # isDisabled
  // The action button should be disabled if that transition is selected.
  isDisabled() {
    return this.getTransition() === WizardPage.transitions.disabled;
  }

  // # persistBefore
  // Causes the wizard page to serialize its form, then call persist with the
  // forms' values. If a callback is provided, it will be called after
  // persistence is completed.
  persistBefore( callback ) {
    const values = this.getPageValues();
    if ( keys( values ).length > 0 && isFunction( this.props.persist ) ) {
      this.props.persist( values, callback );
    } else {
      callback();
    }
  }

  // # link
  // Links state and input value. Tuned to work with Material UI.
  //
  // This method returns a props object you can expand on on the react
  // comopnent you want to link. For example:
  // ```
  // <TextField { ...this.link( 'name' ) } />
  // ```
  // By default, we listen to granular field changes. You can change the
  // event we listen to:
  // ```
  // <TextField { ...this.link( 'name', 'onBlur' ) }
  // ```
  //
  // Different material-ui
  // components return the field value differently. It can either be in
  // `value` or `event.target.value`. In the case of TimePicker, a Date
  // object is stored at the second argument.
  link( field, method = 'onChange' ) {
    const props = {};

    props.value = this.state[ field ];

    props[ method ] = ( event, key, value ) => {
      if ( key instanceof Date ) {
        value = key;
      }
      this.setState( { [ field ]: value || event.target.value } );
    };

    return props;
  }

  render() {
    const {label} = this.getTransition();

    return (
      <div className='tabs-content'>
        <div className='tabs-content__form'>
          { this.getPageContent() }
        </div>
        <div className='tabs-content__action'>
          <div>
            { this.getPageSecondaryActions() }
            <RaisedButton primary
              disabled={ this.isDisabled() }
              onTouchTap={ this.props.onNext }
              label={ label } />
          </div>
        </div>
      </div>
      );
  }

  clickPhotoButton( event ) {
    let device = Device;
    if ( device.platform == 'browser' ) {
      // Go directly to library adding for browser.
      this.onPhotoAddFromLibrary();
    } else {
      // Open the popover for iOS and Android apps.

      // This prevents ghost click.
      event.preventDefault();

      this.setState( {
        popoverOpen: true,
        popoverAnchorEl: event.currentTarget,
      } );
    }
  }

  closePhotoPopover() {
    this.setState( {
      popoverOpen: false,
    } );
  }

  getPhotoButton() {
    return (
      <div>
        <RaisedButton onTouchTap={ this.clickPhotoButton.bind( this ) }
          label='Upload Photo' />
        <Popover open={ this.state.popoverOpen }
          anchorEl={ this.state.popoverAnchorEl }
          anchorOrigin={ { horizontal: 'left', vertical: 'bottom' } }
          targetOrigin={ { horizontal: 'left', vertical: 'top' } }
          onRequestClose={ this.closePhotoPopover.bind( this ) }>
          <Menu>
            <MenuItem onTouchTap={ this.onPhotoAddFromCamera.bind( this ) }
              primaryText='Camera' />
            <MenuItem onTouchTap={ this.onPhotoAddFromLibrary.bind( this ) }
              primaryText='Library' />
          </Menu>
        </Popover>
      </div>
      );
  }

  onPhotoAddFromCamera() {
    // eslint-disable-next-line no-undef
    this.onPhotoAdd( Camera.PictureSourceType.CAMERA );
  }

  onPhotoAddFromLibrary() {
    // eslint-disable-next-line no-undef
    this.onPhotoAdd( Camera.PictureSourceType.PHOTOLIBRARY );
  }

  // Uses the Cordova file reading plugin to work around WKWebView
  // security limitations on iOS by loading photos natively.
  getLocalFileAsURL( path, successFunction ) {
    window.resolveLocalFileSystemURL( path, function( fileSystem ) {
      fileSystem.file( function( file ) {

        var fileReader = new FileReader();

        fileReader.onload = function( e ) {
          var blob = new Blob( [ e.target.result ] );
          var url = URL.createObjectURL( blob );
          successFunction( url );
        };

        fileReader.readAsArrayBuffer( file );

      } );
    } );
  }

  // There is a bug in capturing a photo from the browser:
  // [CB-9852](https://issues.apache.org/jira/browse/CB-9852)
  onPhotoAdd( mySourceType ) {
    // Close the popover now that they selected a source.
    this.setState( { popoverOpen: false } );

    // Work around WKWebView being too big on iOS after using this plugin.
    // We show the bar again in both the success and error cases.
    // eslint-disable-next-line no-undef
    StatusBar.hide();

    navigator.camera.getPicture( photo => {
      // eslint-disable-next-line no-undef
      StatusBar.show();

      let loadedCoverImage = document.createElement( 'img' );
      // Need to wait for loadedCoverImage to load and then keep working
      loadedCoverImage.onload = event => {

        //Shrink the theBlob which was photo but now is a blob
        let MAX_WIDTH = 800;
        let MAX_HEIGHT = 600;

        var newWidth = loadedCoverImage.width;
        var newHeight = loadedCoverImage.height;

        if ( newWidth > newHeight ) {
          if ( newWidth > MAX_WIDTH ) {
            newHeight *= MAX_WIDTH / newWidth;
            newWidth = MAX_WIDTH;
          }
        } else {
          if ( newHeight > MAX_HEIGHT ) {
            newWidth *= MAX_HEIGHT / newHeight;
            newHeight = MAX_HEIGHT;
          }
        }

        let canvas = document.createElement( 'canvas' );
        canvas.width = newWidth;
        canvas.height = newHeight;

        let context = canvas.getContext( '2d' );
        context.drawImage( loadedCoverImage, 0, 0, newWidth, newHeight );
        let resizedDataUrl = canvas.toDataURL( 'image/jpeg' );

        let resizedCoverBlob = dataURLToBlob( resizedDataUrl );

        this.props.wizardActions.setSnackbar( { message: 'Successfully uploaded photo' } );

        resizedCoverBlob.then( coverBlob => {
          this.setState( { coverBlob } );
        } );
      };

      // This will load the photo into the loadedCoverImage element,
      // which will trigger the above onload callback to finish
      // processing and attaching the image.
      const device = Device.getDevice();
      switch ( device.getPhotoEncodingMethod() ) {
      case PhotoEncodingMethods.ImgSrc:
        this.getLocalFileAsURL( photo, function( theURL ) {
          loadedCoverImage.src = theURL;
        } );
        break;
      case PhotoEncodingMethods.Base64String:
        base64StringToBlob( photo ).then( theBlob => {
          loadedCoverImage.src = URL.createObjectURL( theBlob );
        } );
        break;
      case PhotoEncodingMethods.None:
      default:
        console.error( 'Device has no PhotoEncodingMethod. We don\'t know how to handle this photo.' );
      }
    }, err => {
      // eslint-disable-next-line no-undef
      StatusBar.show();
      console.error( err );
    }, {
      // Some common settings are 20, 50, and 100
      quality: 100, /* Camera.. */
      /* eslint-disable no-undef */
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: mySourceType,
      encodingType: Camera.EncodingType.JPG,
      mediaType: Camera.MediaType.PICTURE,
      correctOrientation: true, //Corrects Android orientation quirks
      cameraDirection: Camera.Direction.BACK
    /* eslint-enable no-undef */
    } );
  }
}

WizardPage.transitions = {
  disabled: {
    key: 'disabled',
    label: 'Next'
  },
  next: {
    key: 'next',
    label: 'Next'
  },
  skip: {
    key: 'skip',
    label: 'Skip'
  },
  submit: {
    key: 'submit',
    label: 'Submit'
  }
};

export default WizardPage;

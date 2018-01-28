/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { Paper, RaisedButton, FlatButton, TextField } from 'material-ui';
/*eslint-enable no-unused-vars*/

import classNames from 'classnames';
import _, { bindAll, isObject, isString, isUndefined, isArray } from 'lodash';

import '../../css/block.css';

// This component extends the `Block` with form inputs inside. It is also able
// to display form validation comments if they are supplied.
//
// The structure of the form is determined by the `fields` prop. See the
// `boxes()` function for how the prop is parsed.
export class FormBlock extends Component {
  constructor( props ) {
    super( props );
    bindAll( this, 'onAction', 'createBox' );
  }

  // If an `onAction` callback has been supplied, call it with field values
  // obtained from each text box. `values` is an object with field, field-value
  // pairs.
  onAction() {
    if ( this.props.onAction ) {
      const fields = _( FormBlock.flattenFields( this.props.fields ) )
        .map( 'name' )
        .value();
      const values = _( this.refs )
        .pick( fields )
        .mapValues( val => val.getValue() )
        .value();

      this.props.onAction( values );
    }
  }

  // The `fields` prop is recursive. This field will extract all leaf fields
  // from the recursive structure.
  static flattenFields( fields ) {
    return fields.reduce( ( flattened, field ) => {
      if ( isArray( field.row ) ) {
        return [ ...flattened, ...FormBlock.flattenFields( field.row ) ];
      } else {
        return [ ...flattened, field ];
      }
    }, [] );
  }

  // Map the recursive fields structure to an array of React components.
  boxes() {
    return this.props.fields.map( this.createBox );
  }

  // Generate text boxes for each field, and display validation text for each
  // text box if it exists. The validation object needs to be in json schema
  // format.
  //
  // A field may either be an object represing a leaf field, or it may be
  // an object representing a row of fields. In the row case, wrap that sub-
  // tree of field elements in an 'entry__row' div.
  //
  // Leaf fields have these properties: name, validation, className, element.
  // If a custom field.element is supplied, we use that instead of a TextField.
  createBox( field ) {
    if ( isArray( field.row ) ) {
      let className = 'entry__row';
      if ( field.rowClassName ) {
        className += ' ' + field.rowClassName;
      }
      return (
        <div className={ className }
          key={ field.row }>
          { field.row.map( this.createBox ) }
        </div>
        );
    } else {
      // ***We are working with a leaf field object now.***

      // These props control the validation and type of the TextField
      let textProps = {};

      const error = _.find( this.props.validation, {
        dataPath: '.' + field.name
      } );
      if ( error ) {
        textProps.errorText = error.message;
      }
      if ( [ 'email' ].indexOf( field.name ) >= 0 ) {
        textProps.type = 'email';
      }

      if ( [ 'password', 'confirm_password' ].indexOf( field.name ) >= 0 ) {
        textProps.type = 'password';
      }

      // These props control the appearance of the Field element
      let props = {};
      if ( field.className ) {
        props.className = field.className;
      }

      // Generate a TextField, or if field.element is set, clone that.
      let node;
      if ( field.element ) {
        node = React.cloneElement( field.element, {
          ...props,
          key: field.name,
          hintText: field.name,
          ref: field.name
        } );
      } else {
        node = (
          <TextField { ...props }
            { ...textProps }
            key={ field.name }
            hintText={ field.hint }
            ref={ field.name }
            underlineShow={ true }
            fullWidth={ true } />
        );
      }
      return node;
    }
  }

  render() {
    const {header, problemText, footer} = this.props;
    let props = {};

    // If problemText has been supplied, use that as the `Block`'s header
    if ( problemText ) {
      props.header = problemText;
      props.problem = true;
    } else if ( header ) {
      props.header = header;
      props.problem = false;
    }

    if ( footer ) {
      props.footer = footer;
    }

    const {zDepth, className, thinActionButton} = this.props;
    if ( !isUndefined( zDepth ) ) {
      props.zDepth = zDepth;
    }
    if ( isString( className ) ) {
      props.className = className;
    }

    /*eslint-disable no-unused-vars*/
    let actionProps = {};
    if ( !thinActionButton ) {
      actionProps.fullWidth = true;
      actionProps.secondary = true;
    } else {
      actionProps.style = { alignSelf: 'center' };
    }

    return (
      <Block { ...props }>
        { this.boxes() }
        <div className='entry__spacer' />
        <RaisedButton { ...actionProps }
          className='entry__action'
          onTouchTap={ this.onAction }
          label={ this.props.actionText } />
      </Block>
      );
  /*eslint-enable no-unused-vars*/
  }
}

FormBlock.defaultProps = {
  problemText: null,
  validation: [],
  actionText: 'Submit',
  thinActionButton: false
};
FormBlock.propTypes = {
  header: React.PropTypes.oneOfType( [
    React.PropTypes.string,
    React.PropTypes.object
  ] ),
  footer: React.PropTypes.oneOfType( [
    React.PropTypes.string,
    React.PropTypes.object
  ] ),
  actionText: React.PropTypes.string,
  onAction: React.PropTypes.func,
  problemText: React.PropTypes.string,
  validation: React.PropTypes.array
};

// The `Block` is a piece of material-ui paper that has optional header and
// footers. The header and footer may be specified either as strings, or as
// ready-made react components.
//
// If you specify the header or footer as strings, `Block` will construct
// a default header or footer with that text. Additionally, if the `problem`
// prop is set to true, then the `Block` will format the header in red.
export class Block extends Component {
  render() {
    const problem = this.props.problem;
    const headerClasses = classNames( 'entry__header', {
      'entry__header--error': problem
    } );

    const _header = this.props.header;
    let header;
    if ( isObject( _header ) ) {
      header = _header;
    } else if ( isString( _header ) ) {
      header = <div className={ headerClasses }>
                 { _header }
               </div>;
    }

    const _footer = this.props.footer;
    let footer;
    if ( isObject( _footer ) ) {
      footer = _footer;
    } else if ( isString( _footer ) ) {
      footer = <div className='entry__footer'>
                 { _footer }
               </div>;
    }

    const {zDepth, className} = this.props;
    const names = classNames( 'entry', { [ className ]: className } );

    return (
      <Paper className={ names }
        zDepth={ zDepth }>
        { header }
        { this.props.children }
        { footer }
      </Paper>
      );
  }
}

Block.defaultProps = {
  problem: false,
  zDepth: 2
};
Block.propTypes = {
  problem: React.PropTypes.bool,
  header: React.PropTypes.oneOfType( [
    React.PropTypes.string,
    React.PropTypes.object
  ] ),
  footer: React.PropTypes.oneOfType( [
    React.PropTypes.string,
    React.PropTypes.object
  ] )
};

// If you want to use a custom footer with `Block` or `FormBlock`, you can
// use this component as a base.
export class BlockFooter extends Component {
  render() {
    return (<div className='entry__footer'>
              { this.props.children }
            </div>);
  }
}

// Return a props object to transfer to the `FormBlock`. It will only include
// relevant properties (props that are defined).
export function errorProps( error, validation ) {
  let errorProps = {};
  if ( validation ) {
    errorProps.validation = validation;
  }
  if ( error ) {
    errorProps.problemText = error;
  }
  return errorProps;
}

/*eslint-disable no-unused-vars*/
import React, { Component } from 'react';
import { render } from 'react-dom';

import ClearIcon from 'material-ui/svg-icons/content/clear';
import { CardText, Table, TableBody, TableHeader, TableRow, TableHeaderColumn, TableRowColumn, IconButton } from 'material-ui';
/*eslint-enable no-unused-vars*/

import { days } from 'btc-models';
import '../../css/hours-table.css';

function format( date ) {
  return new Date( date ).toLocaleTimeString( [], {
    hour: 'numeric',
    minute: 'numeric'
  } );
}

export class HoursTable extends Component {
  render() {
    const {removable, onRowRemove} = this.props;

    let keyCounter = 0;
    const hoursData = this.props.hours.map( ( row, index ) => {
      let remove;
      if ( removable ) {
        const button = (
        <IconButton onTouchTap={ () => onRowRemove( index ) }>
          <ClearIcon />
        </IconButton>
        );
        remove = (
          <TableRowColumn>
            { button }
          </TableRowColumn>
        );
      }
      return (
        <TableRow key={ keyCounter++ }>
          <TableRowColumn>
            { days[ row.day ].display }
          </TableRowColumn>
          <TableRowColumn>
            { format( row.opens ) }
          </TableRowColumn>
          <TableRowColumn>
            { format( row.closes ) }
          </TableRowColumn>
          { remove }
        </TableRow>
        );
    } );

    let timezone = '';

    let remove;
    if ( removable ) {
      remove = (
        <TableHeaderColumn>
          Remove
        </TableHeaderColumn>
      );
    } else {
      if ( this.props.hours[ 0 ] ) {
        timezone = <CardText style={ { textAlign: 'right' } }>
                     *
                     { this.props.hours[ 0 ].timezone } TIMEZONE
                   </CardText>;
      }
    }

    return (
      <div>
        <div className="hours-table">
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false }
              adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn>
                  Day
                </TableHeaderColumn>
                <TableHeaderColumn>
                  Opens
                </TableHeaderColumn>
                <TableHeaderColumn>
                  Closes
                </TableHeaderColumn>
                { remove }
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false }
              adjustForCheckbox={ false }>
              { hoursData }
            </TableBody>
          </Table>
        </div>
        { timezone }
      </div>
      );
  }
}

HoursTable.defaultProps = {
  removable: false
};

export default HoursTable;

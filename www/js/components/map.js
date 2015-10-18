import React, {Component} from 'react';
import { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

export default class MyMap extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let markers = this.props.services.map((service) => {
      return (
        <Marker position={[service.lat, service.lon]}>
          <Popup>
            <span>{service.name}<br/>{service.type}</span>
          </Popup>
        </Marker>
      );
    });
    let first = this.props.services[0];
    let position = [first.lat, first.lon];
    return (
      <Map center={position} zoom={13}>
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        { markers }
      </Map>
    );
  }
}

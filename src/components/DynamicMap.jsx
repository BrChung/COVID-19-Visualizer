import React from "react";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import "./DynamicMap.css";

const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 1,
  maxZoom: 4
};

export default class DynamicMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  _renderLayers() {
    return [
      new HeatmapLayer({
        id: "heat",
        data: this.props.data,
        getPosition: d => [d.Longitude, d.Latitude],
        getWeight: d => d.Deaths + d.Confirmed * 0.5,
        radiusPixels: 100
      })
    ];
  }

  render() {
    const { mapStyle = "mapbox://styles/mapbox/dark-v9" } = this.props;

    return (
      <div className="map">
        <DeckGL
          layers={this._renderLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          />

          {this._renderTooltip}
        </DeckGL>
      </div>
    );
  }
}

import React from "react";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import "./DynamicMap.css";

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 40,
  zoom: 1,
  maxZoom: 6,
  minZoom: 1
};

export default class DynamicMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  renderScatterLayer() {
    return [
      new ScatterplotLayer({
        id: "scatter",
        data: this.props.data,
        opacity: 0.5,
        filled: true,
        radiusMinPixels: 2,
        radiusMaxPixels: 50,
        radiusScale: 10,
        getRadius: d => d.Deaths + d.Confirmed * 0.5,
        getPosition: d => [d.Longitude, d.Latitude],
        getFillColor: d =>
          d.Deaths > 0 ? [200, 0, 40, 150] : [255, 140, 0, 100],

        pickable: true,
        onHover: ({ object, x, y }) => {
          const el = document.getElementById("tooltip");
          if (object) {
            const {
              Deaths,
              Confirmed,
              Recovered,
              County,
              Province_State,
              Country_Region,
              Combined_Key
            } = object;
            var Location;
            if (Combined_Key) {
              Location = Combined_Key;
            } else {
              Location = "";
              if (County) {
                Location = Location + County + ", ";
              }
              if (Province_State) {
                Location = Location + Province_State + ", ";
              }
              if (Country_Region) {
                Location = Location + Country_Region;
              }
            }
            el.innerHTML = `<h3>${Location}</h3>
            <h4>Active: ${Confirmed - Deaths - Recovered}</h4>
            <h4>Confirmed: ${Confirmed}</h4>
            <h4>Deaths: ${Deaths}</h4>
            <h4>Recovered: ${Recovered}</h4>`;
            el.style.display = "block";
            el.style.opacity = 0.9;
            el.style.left = x + "px";
            el.style.top = y + "px";
          } else {
            el.style.opacity = 0.0;
          }
        }
      })
    ];
  }

  renderHeatLayer() {
    if (this.props.isDesktop && this.props.useHeatMap) {
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
  }

  render() {
    const { mapStyle = "mapbox://styles/mapbox/dark-v9" } = this.props;

    return (
      <div className="map">
        <DeckGL
          layers={[this.renderScatterLayer(), this.renderHeatLayer()]}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          />
        </DeckGL>
        <div id="tooltip"></div>
      </div>
    );
  }
}

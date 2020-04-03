import React from "react";
import { StaticMap } from "react-map-gl";
import DeckGL, { FlyToInterpolator } from "deck.gl";
import { ScatterplotLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
//import CircularProgress from "@material-ui/core/CircularProgress";

import "./DynamicMap.css";

const getLocationData = async () =>
  await (await fetch("/data/04-01-2020.json")).json();

export default class DynamicMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: {
        latitude: 40,
        longitude: 0,
        zoom: 1,
        maxZoom: 6,
        minZoom: 1,
        bearing: 0,
        pitch: 0
      },
      location: [],
      options: []
    };
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._goToLocation = this._goToLocation.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
  }

  componentDidMount() {
    getLocationData().then(data => this.setOptions(data));
  }

  setOptions(data) {
    this.setState({ options: data });
  }

  _onViewStateChange({ viewState }) {
    this.setState({ viewState });
  }

  _goToLocation(lat, lng) {
    this.setState({
      viewState: {
        ...this.state.viewState,
        longitude: lng,
        latitude: lat,
        zoom: 5,
        pitch: 0,
        bearing: 0,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator()
      }
    });
  }

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

  onLocationChange = (event, values) => {
    this.setState({
      location: values
    });
    if (values != null) {
      this._goToLocation(values.Latitude, values.Longitude);
    }
  };

  render() {
    const { mapStyle = "mapbox://styles/mapbox/dark-v9" } = this.props;
    const { viewState } = this.state;
    const options = this.state.options;

    return (
      <div className="map">
        <DeckGL
          layers={[this.renderScatterLayer(), this.renderHeatLayer()]}
          viewState={viewState}
          controller={true}
          onViewStateChange={this._onViewStateChange}
        >
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          />
        </DeckGL>
        <div id="tooltip"></div>
        <div className="search-bar">
          <Autocomplete
            id="location-search"
            onChange={this.onLocationChange}
            options={options}
            groupBy={option => option.Country_Region}
            getOptionLabel={option => option.Combined_Key}
            loading={this.state.loading}
            style={{ width: 300 }}
            renderInput={params => (
              <TextField
                {...params}
                label="Location"
                variant="filled"
                color="primary"
              />
            )}
          />
        </div>
      </div>
    );
  }
}

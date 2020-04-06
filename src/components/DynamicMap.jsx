import React from "react";
import { StaticMap } from "react-map-gl";
import DeckGL, { FlyToInterpolator } from "deck.gl";
import { ScatterplotLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CountUp from "react-countup";

import "./DynamicMap.css";

function numberWithCommas(x) {
  if (x === null) {
    return 0;
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
        pitch: 0,
      },
      location: null,
    };
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._goToLocation = this._goToLocation.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
  }

  componentDidMount() {}

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
        transitionInterpolator: new FlyToInterpolator(),
      },
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
        getRadius: (d) => d.Deaths + d.Confirmed * 0.55,
        getPosition: (d) => [d.Longitude, d.Latitude],
        getFillColor: (d) =>
          d.Deaths > 0 ? [200, 0, 40, 150] : [255, 140, 0, 100],

        pickable: true,
        onHover: ({ object, x, y }) => {
          const el = document.getElementById("tooltip");
          if (object) {
            const { Deaths, Confirmed, Recovered } = object;
            var Location = this.getCombinedKey(object);
            el.innerHTML = `<h3 style="color:white">${Location}</h3>
            <h4 style="color:white">Confirmed: <span class="confirmed">${numberWithCommas(
              Confirmed
            )}</span></h4>
            <h4 style="color:white">Deaths: <span class="deaths">${numberWithCommas(
              Deaths
            )}</span></h4>
            <h4 style="color:white">Recovered: <span class="recovered">${numberWithCommas(
              Recovered
            )}</span></h4>
            <h4 style="color:white">Active: <span class="active">${numberWithCommas(
              Confirmed - Deaths - Recovered
            )}</span></h4>`;
            el.style.display = "block";
            el.style.opacity = 0.9;
            el.style.left = x + "px";
            el.style.top = y + "px";
          } else {
            el.style.opacity = 0.0;
          }
        },
      }),
    ];
  }

  renderHeatLayer() {
    if (this.props.isDesktop && this.props.useHeatMap) {
      return [
        new HeatmapLayer({
          id: "heat",
          data: this.props.data,
          getPosition: (d) => [d.Longitude, d.Latitude],
          getWeight: (d) => d.Deaths + d.Confirmed * 0.5,
          radiusPixels: 100,
        }),
      ];
    }
  }

  onLocationChange = (event, values) => {
    this.setState({ location: values });
    if (values != null) {
      this._goToLocation(values.Latitude, values.Longitude);
      const el = document.getElementById("tooltip");
      if (values) {
        const { Deaths, Confirmed, Recovered } = values;
        var Location = this.getCombinedKey(values);
        el.innerHTML = `<h3 style="color:white">${Location}</h3>
        <h4 style="color:white">Confirmed: <span class="confirmed">${numberWithCommas(
          Confirmed
        )}</span></h4>
        <h4 style="color:white">Deaths: <span class="deaths">${numberWithCommas(
          Deaths
        )}</span></h4>
        <h4 style="color:white">Recovered: <span class="recovered">${numberWithCommas(
          Recovered
        )}</span></h4>
        <h4 style="color:white">Active: <span class="active">${numberWithCommas(
          Confirmed - Deaths - Recovered
        )}</span></h4>`;
        el.style.display = "block";
        el.style.opacity = 0.9;
        el.style.left = "50%";
        el.style.top = "50%";
      } else {
        el.style.opacity = 0.0;
      }
    }
  };

  clearSearch() {
    this.setState({ location: null });
    const el = document.getElementById("tooltip");
    el.innerHTML = "";
    el.style.left = "0px";
    el.style.top = "0px";
  }

  getCombinedKey(location) {
    const { County, Province_State, Country_Region, Combined_Key } = location;
    var combinedKey;
    if (Combined_Key) {
      combinedKey = Combined_Key;
    } else {
      combinedKey = "";
      if (County) {
        combinedKey = combinedKey + County + ", ";
      }
      if (Province_State) {
        combinedKey = combinedKey + Province_State + ", ";
      }
      if (Country_Region) {
        combinedKey = combinedKey + Country_Region;
      }
    }
    return combinedKey;
  }

  render() {
    const { mapStyle = "mapbox://styles/mapbox/dark-v9" } = this.props;
    const { viewState } = this.state;

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
        <div className="search-bar">
          <Autocomplete
            value={this.state.location}
            disabled={this.props.searchDisabled}
            id="location-search"
            onChange={this.onLocationChange}
            options={this.props.locationData}
            groupBy={(option) => option.Country_Region}
            getOptionLabel={(option) => this.getCombinedKey(option)}
            loading={this.state.loading}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                variant="filled"
                color="primary"
              />
            )}
          />
        </div>
        <div className="world-info">
          <p style={{ color: "white", lineHeight: 0 }}>Total Confirmed</p>
          <h2 style={{ color: "red" }}>
            <CountUp
              start={this.props.prevTotalConfirmed}
              end={this.props.totalConfirmed}
              duration={1}
              separator=","
            ></CountUp>
          </h2>
          <p style={{ color: "white", lineHeight: 0 }}>Total Deaths</p>
          <h2 style={{ color: "white" }}>
            <CountUp
              start={this.props.prevTotalDeaths}
              end={this.props.totalDeaths}
              duration={1}
              separator=","
            ></CountUp>
          </h2>
          <p style={{ color: "white", lineHeight: 0 }}>Total Recovered</p>
          <h2 style={{ color: "green" }}>
            <CountUp
              start={this.props.prevTotalRecovered}
              end={this.props.totalRecovered}
              duration={1}
              separator=","
            ></CountUp>
          </h2>
          <p style={{ color: "white", lineHeight: 0 }}>Total Active</p>
          <h2 style={{ color: "yellow" }}>
            <CountUp
              start={this.props.prevTotalActive}
              end={this.props.totalActive}
              duration={1}
              separator=","
            ></CountUp>
          </h2>
        </div>
        <div id="tooltip"></div>
      </div>
    );
  }
}

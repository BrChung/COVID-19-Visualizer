import React from "react";
import {
  _MapContext as MapContext,
  StaticMap,
  NavigationControl,
  //FullscreenControl,
} from "react-map-gl";
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
        radiusMinPixels: 5,
        radiusMaxPixels: 50,
        radiusScale: 1000,
        getRadius: (d) => Math.sqrt(d.Deaths + d.Confirmed * 0.5),
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
            if (this.props.isDesktop) {
              el.style.left = x + "px";
              el.style.top = y + "px";
            } else {
              el.style.bottom = "0%";
            }
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
        if (this.props.isDesktop) {
          el.style.left = "50%";
          el.style.top = "50%";
        } else {
          el.style.bottom = "0%";
        }
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
      <div id="map">
        <DeckGL
          layers={[this.renderScatterLayer(), this.renderHeatLayer()]}
          viewState={viewState}
          controller={true}
          onViewStateChange={this._onViewStateChange}
          ContextProvider={MapContext.Provider}
        >
          <div style={{ position: "absolute", padding: 10, right: 0 }}>
            <NavigationControl />
          </div>
          {/* <div style={{ position: "absolute", padding: 10, right: 40 }}>
            <FullscreenControl container={document.querySelector("#map")} />
          </div> */}
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          ></StaticMap>
        </DeckGL>
        {this.props.isDesktop && (
          <div className="world-info">
            <p>
              <span className="header">Total Confirmed</span>
            </p>
            <h2>
              <span className="confirmed">
                <CountUp
                  start={this.props.prevTotalConfirmed}
                  end={this.props.totalConfirmed}
                  duration={1}
                  separator=","
                ></CountUp>
              </span>
            </h2>
            <p>
              <span className="header">Total Deaths</span>
            </p>
            <h2>
              <span className="deaths">
                <CountUp
                  start={this.props.prevTotalDeaths}
                  end={this.props.totalDeaths}
                  duration={1}
                  separator=","
                ></CountUp>
              </span>
            </h2>
            <p>
              <span className="header">Total Recovered</span>
            </p>
            <h2>
              <span className="recovered">
                <CountUp
                  start={this.props.prevTotalRecovered}
                  end={this.props.totalRecovered}
                  duration={1}
                  separator=","
                ></CountUp>
              </span>
            </h2>
            <span className="header">
              <p>Total Active</p>
            </span>
            <h2>
              <span className="active">
                <CountUp
                  start={this.props.prevTotalActive}
                  end={this.props.totalActive}
                  duration={1}
                  separator=","
                ></CountUp>
              </span>
            </h2>
          </div>
        )}
        <div id="tooltip"></div>
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
      </div>
    );
  }
}

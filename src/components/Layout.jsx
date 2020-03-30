import React from "react";
import DynamicMap from "./DynamicMap";
import "./Layout.css";

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      covidData: undefined
    };
  }

  componentDidMount() {}

  setData() {
    const pathToJSON = "/data/03-12-2020.json";
    fetch(pathToJSON)
      .then(res => res.json())
      .then(
        result => {
          console.log(result);
          this.setState({
            covidData: result
          });
        },
        error => {
          console.warn(error);
        }
      );
  }

  setData2() {
    const pathToJSON = "/data/03-29-2020.json";
    fetch(pathToJSON)
      .then(res => res.json())
      .then(
        result => {
          console.log(result);
          this.setState({
            covidData: result
          });
        },
        error => {
          console.warn(error);
        }
      );
  }

  render() {
    return (
      <div className="root">
        <div className="container">
          <p>Test</p>
          <button
            onClick={() => {
              this.setData();
            }}
          >
            Load Data
          </button>
          <button
            onClick={() => {
              this.setData2();
            }}
          >
            Load Data 2
          </button>
        </div>
        <div className="map-container">
          <DynamicMap data={this.state.covidData}></DynamicMap>
        </div>
      </div>
    );
  }
}

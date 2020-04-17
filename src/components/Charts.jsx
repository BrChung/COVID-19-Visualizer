import React from "react";
import TheCurve from "./Charts/TheCurve";
import "./Charts.css";

export default class Charts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      countryList: [],
    };
  }

  componentDidMount() {
    this.getCountryList();
  }

  getCountryList() {
    this.getCountryData("/data/time_series/globalConfirmed.json").then(
      (data) => {
        var countryList = [];
        var indx;
        for (indx in data) {
          countryList.push(data[indx]["Country"]);
        }
        countryList.push("World");
        this.setState({ countryList });
        return;
      }
    );
  }

  getCountryData = async (pathToJSON) => await (await fetch(pathToJSON)).json();

  render() {
    return <TheCurve countryList={this.state.countryList}></TheCurve>;
  }
}

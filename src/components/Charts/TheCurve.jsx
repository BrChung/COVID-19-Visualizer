import React from "react";
import { Line } from "react-chartjs-2";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import "./TheCurve.css";

function subtractArr(arrA, arrB) {
  let res = arrA.map(function (item, index) {
    return item - arrB[index];
  });
  return res;
}

function addArr(arrA, arrB) {
  let res = arrA.map(function (item, index) {
    return item + arrB[index];
  });
  return res;
}

export default class TheCurve extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      labels: [],
      confirmedData: [],
      deathData: [],
      recoveredData: [],
      susceptibleData: [],
      hospitalBeds: [],
      country: null,
      selectedCountry: "World",
    };
  }

  componentDidMount() {
    this.getSeriesData("globalConfirmed", "World", (result) => {
      this.setState({
        labels: result.labels,
        confirmedData: result.data,
      });
    });
    this.getSeriesData("globalDeaths", "World", (result) => {
      this.setState({
        deathData: result.data,
      });
    });
    this.getSeriesData("globalRecovered", "World", (result) => {
      this.setState({
        recoveredData: result.data,
      });
    });
  }

  onCountryChange = (event, value) => {
    this.setState({ selectedCountry: value });
    this.getSeriesData("globalConfirmed", value, (result) => {
      this.setState({
        labels: result.labels,
        confirmedData: result.data,
      });
    });
    this.getSeriesData("globalDeaths", value, (result) => {
      this.setState({
        deathData: result.data,
      });
    });
    this.getSeriesData("globalRecovered", value, (result) => {
      this.setState({
        recoveredData: result.data,
      });
    });
  };

  getCountryData = async (pathToJSON) => await (await fetch(pathToJSON)).json();

  getSeriesData(series, countryName, callback) {
    const JSONPath = "/data/time_series/".concat(series, ".json");
    var tmpLabels = [];
    var tmpData = [];
    this.getCountryData(JSONPath).then((data) => {
      if (countryName === "World") {
        const combined = new Promise((resolve, reject) => {
          let result = data.reduce((a, obj) => {
            if (obj === null) {
              console.log("Unknown Object");
              resolve(a);
              return null;
            } else {
              Object.entries(obj).forEach(([key, val]) => {
                if (key !== "Country") {
                  a[key] = (a[key] || 0) + val;
                }
              });
              return a;
            }
          });
          resolve(result);
        });
        combined.then(function (combined) {
          for (let [key, value] of Object.entries(combined)) {
            if (key !== "Country") {
              tmpLabels.push(key);
              tmpData.push(value);
            }
          }
        });
        callback({ labels: tmpLabels, data: tmpData });
      } else {
        let object = data.find((obj) => {
          return obj.Country === countryName;
        });
        for (let [key, value] of Object.entries(object)) {
          if (key !== "Country") {
            tmpLabels.push(key);
            tmpData.push(value);
          }
        }
        callback({ labels: tmpLabels, data: tmpData });
      }
    });
  }

  render() {
    const data = {
      labels: this.state.labels,
      datasets: [
        {
          // hidden: true,
          label: "Confirmed",
          backgroundColor: "#c62828",
          borderColor: "#c62828",
          data: this.state.confirmedData,
          fill: false,
        },
        {
          label: "Deaths",
          backgroundColor: "#bdbdbd",
          borderColor: "#bdbdbd",
          data: this.state.deathData,
          fill: false,
        },
        {
          label: "Recovered",
          backgroundColor: "#00897b",
          borderColor: "#00897b",
          data: this.state.recoveredData,
          fill: false,
        },
        {
          label: "Active",
          backgroundColor: "#ffb300",
          borderColor: "#ffb300",
          data: subtractArr(
            this.state.confirmedData,
            addArr(this.state.deathData, this.state.recoveredData)
          ),
          fill: false,
        },
      ],
    };
    const options = {
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "week",
              displayFormats: {
                week: "MMM D",
              },
              parser: "MM/DD/YY",
              tooltipFormat: "ll",
            },
            ticks: {
              min: "2/20/20",
              fontColor: "#ffffff",
            },
            distribution: "series",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Date",
              fontColor: "#ffffff",
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              callback: function numberWithCommas(value) {
                if (value === null) {
                  return 0;
                }
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              },
              fontColor: "#ffffff",
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Population",
              fontColor: "#ffffff",
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || "";
            function numberWithCommas(value) {
              if (value === null) {
                return 0;
              }
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            if (label) {
              label += ": ";
            }
            label += numberWithCommas(tooltipItem.yLabel);
            return label;
          },
        },
        mode: "index",
        intersect: false,
      },
      hover: {
        animationDuration: 400,
        mode: "nearest",
        intersect: true,
      },
      responsive: true,
      title: {
        display: true,
        text: this.state.selectedCountry,
        fontColor: "#ffffff",
      },
      legend: {
        labels: {
          fontColor: "#ffffff",
        },
        position: "bottom",
      },
      layout: {
        padding: {
          top: 60,
        },
      },
      maintainAspectRatio: false,
    };
    return (
      <div className="the-curve">
        <Line data={data} options={options}></Line>
        <div className="country-search">
          <Autocomplete
            value={this.state.country}
            id="country-search"
            onChange={this.onCountryChange}
            options={this.props.countryList}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
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

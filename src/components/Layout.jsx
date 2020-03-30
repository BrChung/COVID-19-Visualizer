import React from "react";
import DynamicMap from "./DynamicMap";
import "./Layout.css";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";

const lastUpdated = new Date("2020-03-29T00:00:00");

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      covidData: undefined,
      selectedDate: lastUpdated
    };
  }

  componentDidMount() {
    const dateString = moment(lastUpdated).format("MM-DD-YYYY");
    const dataDir = "/data/";
    const pathToJSON = dataDir.concat(dateString, ".json");
    fetch(pathToJSON)
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            covidData: result
          });
        },
        error => {
          console.warn(error);
        }
      );
  }

  setData() {
    const pathToJSON = "/data/02-12-2020.json";
    fetch(pathToJSON)
      .then(res => res.json())
      .then(
        result => {
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
          this.setState({
            covidData: result
          });
        },
        error => {
          console.warn(error);
        }
      );
  }

  handleDateChange = (event, date) => {
    const dateString = moment(date, "M/D/Y").format("MM-DD-YYYY");
    const dataDir = "/data/";
    const pathToJSON = dataDir.concat(dateString, ".json");
    fetch(pathToJSON)
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            covidData: result,
            selectedDate: date
          });
        },
        error => {
          console.warn(error);
        }
      );
  };

  render() {
    const selectedDate = this.state.selectedDate;

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
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Pick a Date"
              minDate={new Date("2020-01-22T00:00:00")}
              maxDate={lastUpdated}
              value={selectedDate}
              onChange={this.handleDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date"
              }}
            />
          </MuiPickersUtilsProvider>
        </div>
        <div className="map-container">
          <DynamicMap data={this.state.covidData}></DynamicMap>
        </div>
      </div>
    );
  }
}

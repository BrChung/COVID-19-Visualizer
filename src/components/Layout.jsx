import React from "react";
import DynamicMap from "./DynamicMap";
import "./Layout.css";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";

import AwesomeDebouncePromise from "awesome-debounce-promise";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";

const fetchData = pathToJSON => fetch(pathToJSON).then(res => res.json());

const fetchDataDebounced = AwesomeDebouncePromise(fetchData, 500);

const firstDataDate = new Date("2020-01-22T00:00:00");

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      covidData: undefined,
      selectedDate: this.props.lastUpdated,
      daysFromStart: moment(this.props.lastUpdated).diff(
        moment(firstDataDate),
        "days"
      ),
      playAnimation: false
    };
  }

  componentDidMount() {
    const dateString = moment(this.props.lastUpdated).format("MM-DD-YYYY");
    const dataDir = "/data/";
    const pathToJSON = dataDir.concat(dateString, ".json");
    const result = fetchData(pathToJSON);
    this.setState({ covidData: result });
  }

  handleDateChange = (event, date) => {
    const dateString = moment(date, "MM/DD/YYYY").format("MM-DD-YYYY");
    const dataDir = "/data/";
    const pathToJSON = dataDir.concat(dateString, ".json");
    const result = fetchData(pathToJSON);
    this.setState({
      covidData: result,
      daysFromStart: moment(date, "MM/DD/YYYY").diff(
        moment(firstDataDate),
        "days"
      )
    });
  };

  //Function is called whenever slider changes state (new date is chosen by user)
  updateDateValue = (event, newValue) => {
    //newValue may not be new, whenever slider change event is detected - only run if array size value is changed
    if (newValue !== this.state.daysFromStart) {
      this.setState({
        daysFromStart: newValue,
        selectedDate: moment(firstDataDate)
          .add(newValue, "days")
          .format("MM/DD/YYYY")
      });
      const dateString = moment(firstDataDate)
        .add(newValue, "days")
        .format("MM-DD-YYYY");
      const dataDir = "/data/";
      const pathToJSON = dataDir.concat(dateString, ".json");
      const result = fetchDataDebounced(pathToJSON);
      this.setState({ covidData: result });
    }
  };

  playAnimation() {
    if (this.state.selectedDate === this.props.lastUpdated) {
      alert("NAH");
    } else {
      this.setState({ playAnimation: true });
      for (
        let i = 0,
          endDay = moment(this.props.lastUpdated).diff(
            moment(this.state.selectedDate, "MM/DD/YYYY"),
            "days"
          ),
          startDay = this.state.selectedDate,
          days = this.state.daysFromStart;
        i <= endDay;
        i++
      ) {
        setTimeout(() => {
          const dateString = moment(startDay, "MM/DD/YYYY")
            .add(i, "days")
            .format("MM-DD-YYYY");
          const dataDir = "/data/";
          const pathToJSON = dataDir.concat(dateString, ".json");
          const result = fetchData(pathToJSON);
          this.setState({ covidData: result });
          if (i === endDay) {
            this.setState({
              playAnimation: false,
              selectedDate: moment(startDay, "MM/DD/YYYY")
                .add(i, "Days")
                .format("MM/DD/YYYY"),
              daysFromStart: days + i
            });
          } else {
            this.setState({
              selectedDate: moment(startDay, "MM/DD/YYYY")
                .add(i, "Days")
                .format("MM/DD/YYYY"),
              daysFromStart: days + i
            });
          }
        }, i * 900);
      }
    }
  }

  //Returns text as valuetext string
  valueText(value) {
    return `${value}`;
  }

  labelFormat(value) {
    return `03/10/2020`;
  }

  render() {
    const selectedDate = this.state.selectedDate;

    const totalDays = moment(this.props.lastUpdated).diff(
      moment(firstDataDate),
      "days"
    );

    return (
      <div className="root">
        <div className="container">
          <div className="MuiSlider">
            <Typography id="array-size-slider" gutterBottom>
              Date Slider
            </Typography>
            <Slider
              value={this.state.daysFromStart}
              onChange={this.updateDateValue}
              disabled={this.state.playAnimation}
              defaultValue={0}
              getAriaValueText={this.valueText}
              aria-labelledby="array-size-slider"
              valueLabelDisplay="off"
              valueLabelFormat={this.labelFormat}
              step={1}
              marks
              min={0}
              max={totalDays}
            />
          </div>

          <p>{this.state.daysFromStart}</p>
          <p>{this.state.test}</p>
          <button
            onClick={() => {
              this.playAnimation();
            }}
          >
            Play Animation
          </button>

          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Pick a Date"
              disabled={this.state.playAnimation}
              minDate={firstDataDate}
              maxDate={this.props.lastUpdated}
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

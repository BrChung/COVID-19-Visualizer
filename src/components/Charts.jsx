import React from "react";
import { Line } from "react-chartjs-2";
import "./Charts.css";

export default class Charts extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentDidMount() {}

  render() {
    const data = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "My First dataset",
          backgroundColor: "#FF0000",
          borderColor: "#FF0000",
          data: [1, 2, 3, 4, 5, 6, 7],
          fill: false,
        },
      ],
    };
    return (
      <div>
        <p>Hi</p>
        <Line data={data}></Line>
      </div>
    );
  }
}

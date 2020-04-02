import React from "react";
import Layout from "./components/Layout";
import { ThemeProvider } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import theme from "./theme";
import moment from "moment";
import "./App.css";

//XMLHttpRequest async is deprecated on main thread
// var request = new XMLHttpRequest();
// request.open("GET", "./lastUpdated.txt", false);
// request.send(null);
// var dateString = "03-01-2020";
// if (request.status === 200) {
//   if (request.responseText.includes("<")) {
//     alert("Error, data is not updated. Please contact software administrator.");
//   } else {
//     dateString = request.responseText;
//   }
// } else {
//   alert("Error, data is not updated. Please contact software administrator.");
// }
const lastUpdatedDate = moment("04-01-2020", "MM-DD-YYYY");

function App() {
  const isDesktop = useMediaQuery("(min-width:600px)");
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Layout isDesktop={isDesktop} lastUpdated={lastUpdatedDate}></Layout>
      </ThemeProvider>
    </div>
  );
}

export default App;

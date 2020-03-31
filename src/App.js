import React from "react";
import Layout from "./components/Layout";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "./theme";
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
const lastUpdatedDate = new Date("03-30-2020");

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Layout lastUpdated={lastUpdatedDate}></Layout>
      </ThemeProvider>
    </div>
  );
}

export default App;

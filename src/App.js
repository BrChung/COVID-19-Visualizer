import React from "react";
import Layout from "./components/Layout";
import { ThemeProvider } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import theme from "./theme";
import moment from "moment";
import { lastUpdated } from "./lastUpdated";
import "./App.css";

const lastUpdatedDate = moment(lastUpdated, "MM-DD-YYYY");

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

import React from "react";
import Layout from "./components/Layout";
import "./App.css";

var request = new XMLHttpRequest();
request.open("GET", "./lastUpdated.txt", false);
request.send(null);
var dateString = "03-01-2020";
if (request.status === 200) {
  if (request.responseText.includes("<")) {
    alert("Error, data is not updated. Please contact software administrator.");
  } else {
    dateString = request.responseText;
  }
} else {
  alert("Error, data is not updated. Please contact software administrator.");
}
const lastUpdatedDate = new Date(dateString);

function App() {
  return (
    <div className="App">
      <Layout lastUpdated={lastUpdatedDate}></Layout>
    </div>
  );
}

export default App;

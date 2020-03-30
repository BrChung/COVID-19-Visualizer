//JavaScript Node.js Function to retrieve new Data Files
//Usage: node retrieveData.js 02-07-2020
//Date must be in MM-DD-YYYY Format

const fs = require("fs");
const request = require("request");
const { StringStream } = require("scramjet");

const args = process.argv.slice(2);
const date = args[0];
const baseURL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
const covidData_URL = baseURL.concat(date, ".csv");
const dataDirPath = "./public/data/";
const saveFilePath = dataDirPath.concat(date, ".json");
var objectData = [];

console.log("Attempting to retieve data from " + date + "...");

request
  .get(covidData_URL) // fetch csv
  .on("response", response => {
    if (response.statusCode !== 200) {
      console.log("Response status was " + response.statusCode);
      process.exit(1);
    }
  })
  .pipe(new StringStream()) // pass to stream
  .CSVParse({ header: true, dynamicTyping: true }) // parse into objects
  .consume(object => objectData.push(object)) // do whatever you like with the objects
  .then(() => {
    console.log("Parse complete!");
    var mapObj = {
      Lat: "Latitude",
      Long_: "Longitude",
      Admin2: "County"
    };
    var json = JSON.stringify(objectData);
    //Following March 21st column names have been changed
    var json = json.replace(/Lat|Long_|Admin2/g, function(matched) {
      return mapObj[matched];
    });
    fs.writeFile(saveFilePath, json, "utf8", err => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
  });

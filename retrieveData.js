/**
 * Copyright © 2020 Brian Chung
 * JavaScript Node.js Script to retrieve new Data Files
 * Usage: node retrieveData.js 02-07-2020
 * Date must be in MM-DD-YYYY Format
 * Quirks:
 * Call this script from earliest to latest date,
 *  the script will update the webpage to display upto the most recently retrieved data.
 *  For example, running node retrieveData.js 02-08-2020 will retrieve the report for that day
 *  but also prevent any days further from 02-08-2020 to be shown on the webpage, see lastUpdated.js for adjustment
 * Retrieving data prior to 03/22/2020 may not function correctly, data prior to that date is formatted differently
 */

const fs = require("fs");
const request = require("request");
const { StringStream } = require("scramjet");

// Get Date from user input
const args = process.argv.slice(2);
const date = args[0];
const dateRegExp = /^((0|1)\d{1})-((0|1|2|3)\d{1})-((20)\d{2})$/;
if (date === undefined) {
  console.log("\x1b[31m%s\x1b[0m", "ERROR:", "No Date Entered!");
  console.log("\x1b[2m%s\x1b[0m", "Please retry script with a date:");
  console.log("\x1b[36m%s\x1b[0m", " node retrieveData.js MM-DD-YYYY");
  process.exit(1);
} else if (!dateRegExp.test(date)) {
  console.log("\x1b[31m%s\x1b[0m", "ERROR:", "Invalid Date!");
  console.log(
    "\x1b[2m%s\x1b[0m",
    "Please use MM-DD-YYYY format for date (02-13-2020):"
  );
  console.log("\x1b[36m%s\x1b[0m", " node retrieveData.js MM-DD-YYYY");
  process.exit(1);
}

console.log("\x1b[1m%s\x1b[0m", "Retrieve Data Script Started");

/**
 * Config
 */
const dailyReportPrefixURL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
const dailyReportURL = dailyReportPrefixURL.concat(date, ".csv");
const dailyReportPath = "./public/data/daily_reports/".concat(date, ".json");
const confirmedGlobalURL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const confirmedGlobalPath = "./public/data/time_series/globalConfirmed.json";
const deathsGlobalURL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
const deathsGlobalPath = "./public/data/time_series/globalDeaths.json";
const recoveredGlobalURL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";
const recoveredGlobalPath = "./public/data/time_series/globalRecovered.json";
/*
 ** JSON Objects
 */
var dailyReport = [];
var confirmedGlobal = [];
var deathsGlobal = [];
var recoveredGlobal = [];

console.log(
  "\x1b[2m%s\x1b[0m",
  "Attempting to retrieve daily report for " + date + "..."
);

request
  .get(dailyReportURL) // fetch csv
  .on("response", (response) => {
    if (response.statusCode !== 200) {
      console.log("\x1b[31m%s\x1b[0m", "ERROR:", "Invalid Response!");
      console.log(
        "\x1b[2m%s\x1b[0m",
        "Response status was " + response.statusCode
      );
      process.exit(1);
    }
  })
  .pipe(new StringStream()) // pass to stream
  .CSVParse({ header: true, dynamicTyping: true }) // parse into objects
  .consume((object) => dailyReport.push(object)) // do whatever you like with the objects
  .then(() => {
    console.log("\x1b[2m%s\x1b[0m", "Received Daily Report for " + date + ".");
    var mapObj = {
      Lat: "Latitude",
      Long_: "Longitude",
      Admin2: "County",
    };
    var json = JSON.stringify(dailyReport, null, 2);
    //Following March 21st column names have been changed
    var json = json.replace(/Lat|Long_|Admin2/g, function (matched) {
      return mapObj[matched];
    });
    fs.writeFile(dailyReportPath, json, "utf-8", (err) => {
      if (err) throw err;
      console.log(
        "\x1b[32m%s\x1b[0m",
        "Successfully loaded daily report for " + date + "!"
      );
    });
  });

console.log(
  "\x1b[2m%s\x1b[0m",
  "Attempting to retrieve timeseries for confirmed cases (global)..."
);

request
  .get(confirmedGlobalURL) // fetch csv
  .on("response", (response) => {
    if (response.statusCode !== 200) {
      console.log("\x1b[31m%s\x1b[0m", "ERROR:", "Invalid Response!");
      console.log(
        "\x1b[2m%s\x1b[0m",
        "Response status was " + response.statusCode
      );
      process.exit(1);
    }
  })
  .pipe(new StringStream()) // pass to stream
  .CSVParse({ header: true, dynamicTyping: true }) // parse into objects
  .consume((object) => confirmedGlobal.push(object)) // do whatever you like with the objects
  .then(() => {
    console.log(
      "\x1b[2m%s\x1b[0m",
      "Received timeseries for confirmed cases (global)"
    );
    var mapObj = {
      "Country/Region": "Country",
    };
    var objectDataDropped = new Promise((resolve, reject) => {
      confirmedGlobal.forEach((value, index, array) => {
        delete value["Province/State"];
        delete value["Lat"];
        delete value["Long"];
        if (index === array.length - 1) resolve(confirmedGlobal);
      });
    });

    objectDataDropped.then(function (objectDataDropped) {
      var objectDataReduced = objectDataDropped
        .reduce(
          function (res, obj) {
            if (!(obj["Country/Region"] in res))
              res.__array.push((res[obj["Country/Region"]] = obj));
            else {
              for (let [key, value] of Object.entries(obj)) {
                if (key != "Country/Region") {
                  res[obj["Country/Region"]][key] += obj[key];
                }
              }
            }
            return res;
          },
          { __array: [] }
        )
        .__array.sort(function (a, b) {
          return b["Country/Region"] - a["Country/Region"];
        });
      var json = JSON.stringify(objectDataReduced, null, 2);
      //Following March 21st column names have been changed
      var json = json.replace(/Country\/Region/g, function (matched) {
        return mapObj[matched];
      });

      fs.writeFile(confirmedGlobalPath, json, "utf-8", (err) => {
        if (err) throw err;
        console.log(
          "\x1b[32m%s\x1b[0m",
          "Successfully updated timeseries for confirmed cases (global)!"
        );
      });
      confirmedGlobal = [];
    });
  });

console.log(
  "\x1b[2m%s\x1b[0m",
  "Attempting to retrieve timeseries for deaths (global)..."
);

request
  .get(deathsGlobalURL) // fetch csv
  .on("response", (response) => {
    if (response.statusCode !== 200) {
      console.log("\x1b[31m%s\x1b[0m", "ERROR:", "Invalid Response!");
      console.log(
        "\x1b[2m%s\x1b[0m",
        "Response status was " + response.statusCode
      );
      process.exit(1);
    }
  })
  .pipe(new StringStream()) // pass to stream
  .CSVParse({ header: true, dynamicTyping: true }) // parse into objects
  .consume((object) => deathsGlobal.push(object)) // do whatever you like with the objects
  .then(() => {
    console.log("\x1b[2m%s\x1b[0m", "Received timeseries for deaths (global)");
    var mapObj = {
      "Country/Region": "Country",
    };
    var objectDataDropped = new Promise((resolve, reject) => {
      deathsGlobal.forEach((value, index, array) => {
        delete value["Province/State"];
        delete value["Lat"];
        delete value["Long"];
        if (index === array.length - 1) resolve(deathsGlobal);
      });
    });

    objectDataDropped.then(function (objectDataDropped) {
      var objectDataReduced = objectDataDropped
        .reduce(
          function (res, obj) {
            if (!(obj["Country/Region"] in res))
              res.__array.push((res[obj["Country/Region"]] = obj));
            else {
              for (let [key, value] of Object.entries(obj)) {
                if (key != "Country/Region") {
                  res[obj["Country/Region"]][key] += obj[key];
                }
              }
            }
            return res;
          },
          { __array: [] }
        )
        .__array.sort(function (a, b) {
          return b["Country/Region"] - a["Country/Region"];
        });
      var json = JSON.stringify(objectDataReduced, null, 2);
      //Following March 21st column names have been changed
      var json = json.replace(/Country\/Region/g, function (matched) {
        return mapObj[matched];
      });

      fs.writeFile(deathsGlobalPath, json, "utf-8", (err) => {
        if (err) throw err;
        console.log(
          "\x1b[32m%s\x1b[0m",
          "Successfully updated timeseries for deaths (global)!"
        );
      });
      deathsGlobal = [];
    });
  });

console.log(
  "\x1b[2m%s\x1b[0m",
  "Attempting to retrieve timeseries for recovered (global)..."
);

request
  .get(recoveredGlobalURL) // fetch csv
  .on("response", (response) => {
    if (response.statusCode !== 200) {
      console.log("\x1b[31m%s\x1b[0m", "ERROR:", "Invalid Response!");
      console.log(
        "\x1b[2m%s\x1b[0m",
        "Response status was " + response.statusCode
      );
      process.exit(1);
    }
  })
  .pipe(new StringStream()) // pass to stream
  .CSVParse({ header: true, dynamicTyping: true }) // parse into objects
  .consume((object) => recoveredGlobal.push(object)) // do whatever you like with the objects
  .then(() => {
    console.log(
      "\x1b[2m%s\x1b[0m",
      "Received timeseries for recovered (global)"
    );
    var mapObj = {
      "Country/Region": "Country",
    };
    var objectDataDropped = new Promise((resolve, reject) => {
      recoveredGlobal.forEach((value, index, array) => {
        delete value["Province/State"];
        delete value["Lat"];
        delete value["Long"];
        if (index === array.length - 1) resolve(recoveredGlobal);
      });
    });

    objectDataDropped.then(function (objectDataDropped) {
      var objectDataReduced = objectDataDropped
        .reduce(
          function (res, obj) {
            if (!(obj["Country/Region"] in res))
              res.__array.push((res[obj["Country/Region"]] = obj));
            else {
              for (let [key, value] of Object.entries(obj)) {
                if (key != "Country/Region") {
                  res[obj["Country/Region"]][key] += obj[key];
                }
              }
            }
            return res;
          },
          { __array: [] }
        )
        .__array.sort(function (a, b) {
          return b["Country/Region"] - a["Country/Region"];
        });
      var json = JSON.stringify(objectDataReduced, null, 2);
      //Following March 21st column names have been changed
      var json = json.replace(/Country\/Region/g, function (matched) {
        return mapObj[matched];
      });

      fs.writeFile(recoveredGlobalPath, json, "utf-8", (err) => {
        if (err) throw err;
        console.log(
          "\x1b[32m%s\x1b[0m",
          "Successfully updated timeseries for recovered (global)!"
        );
      });
      recoveredGlobal = [];
    });
  });

//Update Last Updated Date, this will overwrite lastUpdated.js and load the current date into the webpage
const lastUpdatedJS = 'const lastUpdated = "'.concat(
  date,
  '"; export { lastUpdated };'
);
fs.writeFile("./src/lastUpdated.js", lastUpdatedJS, function (err) {
  if (err) throw err;
  console.log(
    "\x1b[32m%s\x1b[0m",
    "Successfully updated react app for new date! (lastUpdated.js)"
  );
});

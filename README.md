# Covid-19 Visualizer

Visualize the spread of Covid-19 with a reactive map and data. [Check it out!](https://visualizecovid19.com)

This visualization is unique from others because it implements date picking functionaltiy; the user may travel back in time to see the spread of Covid-19.

Built with:
- [Deck.Gl](https://deck.gl/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/en/)
- [Material UI](https://material-ui.com/)

## Getting Started

1. Install Dependencies

 ```bash
 npm install
 ```
Download and install [Node.js](https://nodejs.org/en/#download). Note that npm is also installed, so if you are going to use it, you are through with the preliminary steps.
   
2. Set Environment Variables

```js
REACT_APP_MAPBOX_TOKEN=(Insert Mapbox Token Here)
```

An environment variable is a `KEY=value` pair that is stored on the
local system where your code/app is being run and is accessible from within your code.

Create a file `.env` which contains the [Mapbox](https://www.mapbox.com/) token as shown above. This file should be stored in the root directory.

3. Fire Up the Local Server
```bash
npm start
```

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

## Deployment

```bash
npm run build
```

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

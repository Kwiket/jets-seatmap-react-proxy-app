# Jets Seat Map Proxy App

A React app that renders the
[Jets seat map](https://github.com/Kwiket/jets-seatmap-react-lib-pub/blob/version-3/README.md) inside an iframe, so any
web page can embed a seat map without using React. The host page sends the seat map data with `postMessage`; the app
renders the seat map and posts its events back.

## Requirements

Node.js 22.22+ or 24.15+.

## Commands

| Command           | Description                                         |
| ----------------- | --------------------------------------------------- |
| `npm ci`          | Install dependencies                                |
| `npm start`       | Start the dev server at http://localhost:3000       |
| `npm run build`   | Build for production into `./build`                 |
| `npm run preview` | Serve the production build locally                  |
| `npm test`        | Run the tests once (`npm run test:watch` to watch)  |
| `npm run lint`    | Lint with ESLint                                    |
| `npm run format`  | Format with Prettier (`npm run format:check` in CI) |

## Configuration

Copy `.env-sample` to `.env.local` and fill it in. The values are read at build time.

| Variable                      | Description                                                      |
| ----------------------------- | ---------------------------------------------------------------- |
| `REACT_APP_JETS_BASE_API_URL` | Jets API base URL                                                |
| `REACT_APP_JETS_APP_ID`       | Jets API app ID, used unless the host sends `config.apiAppId`    |
| `REACT_APP_JETS_PRIVATE_KEY`  | Jets API key, used unless the host sends `config.apiKey`         |
| `REACT_APP_HOST_APP_URL`      | Host page origin; seat map events are only posted to this origin |

All values are embedded in the built JavaScript and can be read by anyone who loads the app.

## Host page integration

[`example-of-parent-website/`](example-of-parent-website/) is a working host page for manual testing. Point its iframe
`src` at your app URL.

### Sending data to the seat map

Post a message to the iframe with `type: 'seatMaps'` and any of the fields below. Each field is a JSON string or an
already structured value; relaxed JS-like strings (unquoted keys, single quotes, trailing commas) are accepted too.
Fields are merged into the current state, so they can be sent separately.

| Field              | Description                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `config`           | Seat map config, layered over the defaults in `src/common/constants.js` (`colorTheme` per color) |
| `flight`           | Flight to show                                                                                   |
| `availability`     | Seat availability and prices                                                                     |
| `passengers`       | Passengers and their seats                                                                       |
| `currentDeckIndex` | Deck to show, `0` by default                                                                     |

The [seat map library documentation](https://github.com/Kwiket/jets-seatmap-react-lib-pub/blob/version-3/README.md)
describes each field. If a field cannot be parsed, the app shows "Please, set correct data" until a message with valid
fields arrives.

```javascript
iframe.contentWindow.postMessage(
  { type: 'seatMaps', flight: JSON.stringify(flight), passengers: JSON.stringify(passengers) },
  'https://quicket.io/react-proxy-app/'
);
```

### Receiving seat map events

The app posts `{ type: 'seatMaps', <eventName>: <JSON string> }` to its parent window, or to its opener when it is not
framed.

| Event                | Payload                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `onSeatMapInited`    | Initial layout: decks, size, available seats, media                      |
| `onLayoutUpdated`    | Layout after a deck switch                                               |
| `onSeatSelected`     | Passengers with their seats                                              |
| `onSeatUnselected`   | Passengers with their seats                                              |
| `onTooltipRequested` | Seat data only; the library's DOM element and event cannot be serialized |

```javascript
window.addEventListener('message', event => {
  if (event.origin !== 'https://quicket.io' || event.data?.type !== 'seatMaps') return;

  if (event.data.onSeatSelected) {
    const passengers = JSON.parse(event.data.onSeatSelected);
    // ...
  }
});
```

## Project structure

- [`src/App.jsx`](src/App.jsx): renders `JetsSeatMap` with the host data and forwards its events.
- [`src/common/message-service.js`](src/common/message-service.js): receives, parses and sends `postMessage` messages.
- [`src/common/seat-map-config.js`](src/common/seat-map-config.js): builds the seat map config from the host config and
  the defaults.
- [`src/common/constants.js`](src/common/constants.js): message type and default config.

## Docker

The env file is mounted for the build step only, so it is not stored in the image:

```
docker build --no-cache --secret id=env,src=.env.local -t jets-seatmap-react-proxy-app:latest .
```

Keep `--no-cache`: Docker does not include the env file in its build cache key, so a cached build would reuse the
previous values.

```
docker run -d --name jets-seatmap-react-proxy-app -p 8080:80 jets-seatmap-react-proxy-app:latest
```

The app is available at [http://localhost:8080/react-proxy-app/](http://localhost:8080/react-proxy-app/).

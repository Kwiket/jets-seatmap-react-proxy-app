# App Documentation

## Available Commands:

### Install Dependencies

`npm i`

### Run the Application

`npm start` - The application will be available at [http://localhost:3000](http://localhost:3000)

### Build the Application

`npm run build` - The built version of the app will be located in the `./build` directory.

## General Description of the Application

This React application is designed to display an airplane seat map using the `JetsSeatMap` library. It receives data via
messages from an external source (e.g., a parent window), dynamically updates the application's state, and handles data
validation errors.

## File Structure

- **`App.js`**  
  Contains the core application logic and integration with the `JetsSeatMap` component.

- **`src/common/message-service.js`**  
  Implements the `MessageService` class for handling incoming messages and updating data.

- **`src/common/constants.js`**  
  Contains constants for message types used in the application (not shown in the example but assumed to be present).

- **`./example-of-parent-website`**  
  Provides a static example page demonstrating how to use this application within an iframe.

## Application Logic

### Component `App` (`App.js`)

1. **State**

   - `data` (object): Stores processed data from incoming messages.
   - `isError` (boolean): Indicates whether an error occurred during data processing.

2. **Methods**

   - `onDataUpdated(newData, errorStatus)`: Updates the state with new data and the error status provided by the
     `MessageService`.

3. **Effects**

   - Initializes an instance of `MessageService` to listen for incoming messages.
   - Cleans up message listeners when the component is unmounted.

4. **Rendering Logic**
   - Displays an error message if `isError` is `true`.

### Message Service (`message-service.js`)

The `MessageService` class is responsible for managing the flow of data from incoming messages to the React application.

#### Key Methods

1. **`cleanAndParse(value)`**

   - Cleans and converts raw data into a JSON object.
   - Fixes invalid or non-standard formatting.
   - Returns `null` if the processing fails.

2. **`processIncomingMessage(event)`**

   - Processes only messages with the type `MESSAGE_TYPES.SEAT_MAP`.
   - Iterates over each data field, cleans, and parses them.
   - Passes the updated data to the application via `onDataUpdated`.

3. **`startListening()`**

   - Adds a `message` event listener to the `window` object.

4. **`stopListening()`**

   - Removes the `message` event listener.

## Structure of Processed Data

The data is stored in the `data` state, which contains an object with all the parsed information. An example structure:

```javascript
{
   flight: {
      id: '111',
      airlineCode: 'EK',
      flightNo: '50',
      // ...
   },
   availability: [],
   passengers: [],
   config: {
      width: 400,
      lang: 'EN',
      // ...
   }
}
```

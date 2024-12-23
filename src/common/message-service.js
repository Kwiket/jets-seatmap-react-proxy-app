import { MESSAGE_TYPES } from './constants';

export class MessageService {
  constructor({ onDataUpdated }) {
    this.onDataUpdated = onDataUpdated;
    this.processIncomingMessage = this.processIncomingMessage.bind(this);
  }

  /**
   * Cleans and parses the value from the message
   * @param {string} value - The raw string value to be cleaned and parsed
   * @returns {object} Parsed JSON object or null if error occurs
   */
  cleanAndParse(value) {
    try {
      const cleanedValue = value
        .trim()
        .replace(/[\n\t\r]/g, '')
        .replace(/'/g, '"')
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/,(\s*[}\]])/g, '$1');

      return JSON.parse(cleanedValue);
    } catch (error) {
      console.error('Error parsing message value:', error);
      return null;
    }
  }

  /**
   * Processes incoming message and notifies about the new data
   * @param {MessageEvent} event - The message event object
   */
  processIncomingMessage(event) {
    const { type, ...rest } = event.data;

    if (type !== MESSAGE_TYPES.SEAT_MAP) return;
    const results = {};
    let isError = false;

    Object.entries(rest).forEach(([key, value]) => {
      const parsedValue = this.cleanAndParse(value);

      if (parsedValue === null) {
        isError = true;
      } else {
        results[key] = parsedValue;
      }
    });

    if (this.onDataUpdated) {
      this.onDataUpdated(results, isError);
    }
  }

  startListening() {
    window.addEventListener('message', this.processIncomingMessage);
  }

  stopListening() {
    window.removeEventListener('message', this.processIncomingMessage);
  }

  /**
   * Prepares data by stringifying each property
   * @param {object} data - The raw data object
   * @returns {object} - The processed data object with stringified values
   */
  prepareMessageData(data) {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, JSON.stringify(value, null, 2)]));
  }

  /**
   * Sends a message to the parent window
   * @param {string} type - The type of the message
   * @param {object} data - The data to be sent
   */
  sendMessage(type, data) {
    if (!type) {
      console.error('Message type is required to send a message.');
      return;
    }

    const message = {
      type,
      ...this.prepareMessageData(data),
    };

    if (window.parent !== window) {
      window.parent.postMessage(message, process.env.REACT_APP_HOST_APP_URL);
    } else {
      console.error('No parent window detected. The application is not running inside an iframe.');
    }
  }
}

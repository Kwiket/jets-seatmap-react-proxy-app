import { MESSAGE_TYPES } from './constants';

export class MessageService {
  constructor({ onDataUpdated }) {
    this.onDataUpdated = onDataUpdated;
    this.processIncomingMessage = this.processIncomingMessage.bind(this);
  }

  /**
   * Parses a message field. Strict JSON is parsed as is; anything else is treated as relaxed,
   * JS-like input. Values that are not strings were already structured-cloned and pass through.
   * @param {*} value - The raw field value
   * @returns {*} Parsed value or null if it cannot be parsed
   */
  cleanAndParse(value) {
    if (typeof value !== 'string') return value;

    try {
      return JSON.parse(value);
    } catch {
      return this.parseRelaxed(value);
    }
  }

  /**
   * Repairs relaxed, JS-like input (unquoted keys, single quotes, trailing commas) and parses it.
   * Only used as a fallback: the repairs would corrupt valid JSON strings containing quotes or colons.
   * @param {string} value - The raw string value
   * @returns {*} Parsed value or null if it cannot be repaired
   */
  parseRelaxed(value) {
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
    if (event.data?.type !== MESSAGE_TYPES.SEAT_MAP) return;

    console.log('Message received:', event.data);

    const { type, ...rest } = event.data;
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

    const hostWindow = window.parent !== window ? window.parent : window.opener;

    if (!hostWindow) {
      console.error('No host window detected. The application is neither framed nor opened by another window.');
      return;
    }

    hostWindow.postMessage(message, import.meta.env.REACT_APP_HOST_APP_URL);
  }
}

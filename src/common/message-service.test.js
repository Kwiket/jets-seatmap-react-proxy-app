import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageService } from './message-service';

const HOST_URL = 'https://host.example';

describe('MessageService.cleanAndParse', () => {
  const service = new MessageService({});

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it.each([
    ['an apostrophe', `{"passengerLabel":"Conan O'Brien"}`, { passengerLabel: "Conan O'Brien" }],
    ['a "word:" sequence', '{"label":"Seat 20A, note: extra legroom"}', { label: 'Seat 20A, note: extra legroom' }],
    ['a comma before a bracket', '{"label":"a,]"}', { label: 'a,]' }],
  ])('keeps strict JSON intact when a string contains %s', (_, input, expected) => {
    expect(service.cleanAndParse(input)).toEqual(expected);
  });

  it('repairs relaxed JS-like input', () => {
    expect(service.cleanAndParse("{\n  width: 400,\n  lang: 'EN',\n}")).toEqual({ width: 400, lang: 'EN' });
  });

  it('returns null for input it cannot repair', () => {
    expect(service.cleanAndParse('{ width: }')).toBeNull();
  });

  it.each([
    ['an object', { width: 400 }],
    ['a number', 0],
  ])('passes through %s sent without stringifying', (_, value) => {
    expect(service.cleanAndParse(value)).toEqual(value);
  });
});

describe('MessageService.processIncomingMessage', () => {
  let onDataUpdated;
  let service;

  beforeEach(() => {
    onDataUpdated = vi.fn();
    service = new MessageService({ onDataUpdated });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('ignores messages without data', () => {
    expect(() => service.processIncomingMessage({ data: null })).not.toThrow();
    expect(onDataUpdated).not.toHaveBeenCalled();
  });

  it('ignores and does not log messages of other types', () => {
    service.processIncomingMessage({ data: { type: 'react-devtools', flight: '{}' } });

    expect(onDataUpdated).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('parses every field of a seat map message', () => {
    service.processIncomingMessage({ data: { type: 'seatMaps', flight: '{"id":"111"}', currentDeckIndex: '1' } });

    expect(onDataUpdated).toHaveBeenCalledWith({ flight: { id: '111' }, currentDeckIndex: 1 }, false);
  });

  it('reports an error but keeps the fields that parsed', () => {
    service.processIncomingMessage({ data: { type: 'seatMaps', flight: '{"id":"111"}', passengers: '[{' } });

    expect(onDataUpdated).toHaveBeenCalledWith({ flight: { id: '111' } }, true);
  });
});

describe('MessageService.sendMessage', () => {
  let service;

  beforeEach(() => {
    vi.stubEnv('REACT_APP_HOST_APP_URL', HOST_URL);
    service = new MessageService({});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    window.opener = null;
  });

  it('posts stringified fields to the parent frame', () => {
    const parent = { postMessage: vi.fn() };
    vi.spyOn(window, 'parent', 'get').mockReturnValue(parent);

    service.sendMessage('seatMaps', { onSeatSelected: [{ id: '1' }] });

    expect(parent.postMessage).toHaveBeenCalledWith(
      { type: 'seatMaps', onSeatSelected: '[\n  {\n    "id": "1"\n  }\n]' },
      HOST_URL
    );
  });

  it('posts to the opener when not framed', () => {
    window.opener = { postMessage: vi.fn() };

    service.sendMessage('seatMaps', { onLayoutUpdated: { decksCount: 1 } });

    expect(window.opener.postMessage).toHaveBeenCalledWith(
      { type: 'seatMaps', onLayoutUpdated: '{\n  "decksCount": 1\n}' },
      HOST_URL
    );
  });

  it('logs instead of throwing when there is no host window', () => {
    expect(() => service.sendMessage('seatMaps', { onSeatMapInited: {} })).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});

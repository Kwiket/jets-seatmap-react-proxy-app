import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JetsSeatMap } from '@seatmaps.com/react-lib';
import App from './App';

// The real seat map authenticates and fetches from the Jets API.
vi.mock('@seatmaps.com/react-lib', () => ({ JetsSeatMap: vi.fn(() => null) }));

const HOST_URL = 'https://host.example';

const latestSeatMapProps = () => JetsSeatMap.mock.calls.at(-1)[0];

const sendFromHost = fields => {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'seatMaps', ...fields } }));
  });
};

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('App receiving host data', () => {
  it('passes parsed host data to the seat map', () => {
    render(<App />);

    sendFromHost({
      flight: '{"id":"111","airlineCode":"EK"}',
      availability: '[{"label":"20A","price":33}]',
      passengers: '[{"id":"1","seat":null}]',
      currentDeckIndex: '1',
    });

    expect(latestSeatMapProps()).toMatchObject({
      flight: { id: '111', airlineCode: 'EK' },
      availability: [{ label: '20A', price: 33 }],
      passengers: [{ id: '1', seat: null }],
      currentDeckIndex: 1,
    });
  });

  it('layers a partial host config over the app defaults', () => {
    render(<App />);

    sendFromHost({ config: '{"width":500,"colorTheme":{"floorColor":"red"}}' });

    expect(latestSeatMapProps().config).toMatchObject({
      width: 500,
      lang: 'EN',
      colorTheme: { floorColor: 'red', seatLabelColor: 'white' },
    });
  });

  it('lets the host override the built-in credentials', () => {
    render(<App />);

    sendFromHost({ config: '{"apiAppId":"host-app","apiKey":"host-key"}' });

    expect(latestSeatMapProps().config).toMatchObject({ apiAppId: 'host-app', apiKey: 'host-key' });
  });

  it('shows an error instead of the seat map until valid data arrives', () => {
    render(<App />);

    sendFromHost({ passengers: '[{' });
    expect(screen.getByRole('heading', { name: 'Please, set correct data' })).toBeInTheDocument();

    sendFromHost({ passengers: '[]' });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('App forwarding seat map events to the host', () => {
  let parent;

  beforeEach(() => {
    vi.stubEnv('REACT_APP_HOST_APP_URL', HOST_URL);
    parent = { postMessage: vi.fn() };
    vi.spyOn(window, 'parent', 'get').mockReturnValue(parent);
  });

  it.each(['onSeatMapInited', 'onSeatSelected', 'onSeatUnselected', 'onLayoutUpdated'])(
    'forwards %s with its full payload',
    eventName => {
      render(<App />);

      act(() => latestSeatMapProps()[eventName]({ decksCount: 2 }));

      expect(parent.postMessage).toHaveBeenCalledWith(
        { type: 'seatMaps', [eventName]: '{\n  "decksCount": 2\n}' },
        HOST_URL
      );
    }
  );

  it('forwards only the seat of onTooltipRequested, as its element and event are not serializable', () => {
    render(<App />);

    act(() =>
      latestSeatMapProps().onTooltipRequested({
        element: document.createElement('div'),
        event: new MouseEvent('click'),
        seat: { label: '20A' },
      })
    );

    expect(parent.postMessage).toHaveBeenCalledWith(
      { type: 'seatMaps', onTooltipRequested: '{\n  "label": "20A"\n}' },
      HOST_URL
    );
  });
});

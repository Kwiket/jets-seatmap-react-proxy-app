import React, { useEffect, useMemo, useState } from 'react';

import { JetsSeatMap } from '@seatmaps.com/react-lib';
import { MessageService } from './common/message-service';
import { MESSAGE_TYPES } from './common/constants';
import { buildSeatMapConfig } from './common/seat-map-config';

// Seat map events forwarded to the host page, mapped to the payload that is sent.
// onTooltipRequested also carries the seat's DOM element and event, which cannot be
// serialized, so only the seat data is forwarded.
const FORWARDED_EVENTS = {
  onSeatMapInited: data => data,
  onSeatSelected: data => data,
  onSeatUnselected: data => data,
  onLayoutUpdated: data => data,
  onTooltipRequested: data => data.seat,
};

const createEventHandlers = messageService =>
  Object.fromEntries(
    Object.entries(FORWARDED_EVENTS).map(([eventName, toPayload]) => [
      eventName,
      eventData => messageService.sendMessage(MESSAGE_TYPES.SEAT_MAP, { [eventName]: toPayload(eventData) }),
    ])
  );

function App() {
  const [data, setData] = useState({});
  const [isError, setIsError] = useState(false);

  const [messageService] = useState(
    () =>
      new MessageService({
        onDataUpdated: (newData, hasError) => {
          setData(prevData => ({ ...prevData, ...newData }));
          setIsError(hasError);
        },
      })
  );

  const eventHandlers = useMemo(() => createEventHandlers(messageService), [messageService]);
  const config = useMemo(() => buildSeatMapConfig(data.config), [data.config]);

  useEffect(() => {
    messageService.startListening();

    return () => {
      messageService.stopListening();
    };
  }, [messageService]);

  return (
    <div className="App">
      {isError ? (
        <h2 className="error">Please, set correct data</h2>
      ) : (
        <JetsSeatMap
          flight={data.flight}
          availability={data.availability}
          passengers={data.passengers}
          currentDeckIndex={data.currentDeckIndex || 0}
          config={config}
          {...eventHandlers}
        />
      )}
    </div>
  );
}

export default App;

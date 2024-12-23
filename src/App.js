import React, { useEffect, useState } from 'react';

import { JetsSeatMap } from 'jets-seatmap-react-lib';
import { MessageService } from './common/message-service';
import { MESSAGE_TYPES, CONFIG_DATA } from './common/constants';

function App() {
  const [data, setData] = useState({});
  const [isError, setIsError] = useState(false);

  const onDataUpdated = (newData, errorStatus) => {
    if (newData.config) {
      newData.config = {
        ...newData.config,
        apiUrl: process.env.REACT_APP_JETS_BASE_API_URL,
        apiAppId: process.env.REACT_APP_JETS_APP_ID,
        apiKey: process.env.REACT_APP_JETS_PRIVATE_KEY,
      };
    }

    setData(prevData => {
      return {
        ...prevData,
        ...newData,
      };
    });
    setIsError(errorStatus);
  };

  const handleEvent = (key, eventData) => {
    const messageService = new MessageService({ onDataUpdated });
    messageService.sendMessage(MESSAGE_TYPES.SEAT_MAP, { [key]: eventData });
  };

  useEffect(() => {
    const messageService = new MessageService({ onDataUpdated });

    messageService.startListening();

    return () => {
      messageService.stopListening();
    };
  }, []);

  return (
    <div className="App">
      {isError && <h2 className="error">Please, set correct data</h2>}
      {!isError && (
        <JetsSeatMap
          flight={data.flight}
          availability={data.availability}
          passengers={data.passengers}
          currentDeckIndex={data.currentDeckIndex || 0}
          onSeatMapInited={data => {
            handleEvent('onSeatMapInited', data);
          }}
          onSeatSelected={data => {
            handleEvent('onSeatSelected', data);
          }}
          onSeatUnselected={data => {
            handleEvent('onSeatUnselected', data);
          }}
          onLayoutUpdated={data => {
            handleEvent('onLayoutUpdated', data);
          }}
          onTooltipRequested={data => {
            handleEvent('onTooltipRequested', data.seat);
          }}
          config={data.config || CONFIG_DATA}
        />
      )}
    </div>
  );
}

export default App;

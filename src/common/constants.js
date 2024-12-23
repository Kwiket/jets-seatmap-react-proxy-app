export const MESSAGE_TYPES = {
  SEAT_MAP: 'seatMaps',
};

export const FLIGHT_DATA = {
  id: '111',
  airlineCode: 'EK',
  flightNo: '50',
  departureDate: '2025-03-21',
  departure: 'MUC',
  arrival: 'DXB',
  cabinClass: 'A',
};

export const AVAILABILITY_DATA = [
  {
    currency: 'USD',
    label: '20A',
    price: 33,
    onlyForPassengerType: ['ADT', 'CHD', 'INF'],
    additionalProps: [
      {
        label: 'Test prop for all',
        icon: null,
      },
      {
        label: 'Another test prop for all',
        icon: 'wifi',
      },
    ],
    color: 'green',
  },
  {
    currency: 'USD',
    label: '20E',
    price: 33,
    onlyForPassengerType: ['ADT', 'CHD', 'INF'],
    additionalProps: [
      {
        label: 'Clear air',
        icon: null,
      },
      {
        label: 'USB plug',
        icon: 'power',
      },
    ],
    color: 'red',
  },
  {
    currency: 'USD',
    label: '20K',
    price: 33,
    onlyForPassengerType: ['ADT', 'CHD', 'INF'],
    color: 'magenta',
  },
  {
    currency: 'USD',
    label: '21F',
    price: 13,
    onlyForPassengerType: ['ADT', 'CHD', 'INF'],
  },
  {
    currency: 'USD',
    label: '21J',
    price: 13,
    onlyForPassengerType: ['CHD', 'INF'],
  },
  {
    currency: 'USD',
    label: '35K',
    price: 1337,
    onlyForPassengerType: ['CHD', 'INF'],
  },
  {
    currency: 'EUR',
    label: '70E',
    price: 1488,
  },
];

export const PASSANGERS_DATA = [
  {
    passengerType: 'ADT',
    id: '1',
    seat: null,
  },
  {
    id: '2',
    seat: {
      price: 0,
      seatLabel: '21F',
    },
    passengerLabel: 'Alex Test',
    passengerColor: 'brown',
  },
  {
    id: '4',
    seat: {
      price: 0,
      seatLabel: '21J',
    },
    passengerLabel: 'Big Lebowski',
    passengerColor: 'green',
  },
  {
    id: '3',
    passengerType: 'CHD',
    seat: null,
    passengerLabel: 'John Snow',
    passengerColor: 'orange',
  },
];

export const DECK_DATA = 0;

export const CONFIG_DATA = {
  width: 400,
  lang: 'EN',
  horizontal: false,
  rightToLeft: false,
  visibleFuselage: true,
  visibleWings: true,
  builtInDeckSelector: true,
  singleDeckMode: true,
  builtInTooltip: true,
  externalPassengerManagement: false,
  tooltipOnHover: false,
  apiUrl: process.env.REACT_APP_JETS_BASE_API_URL,
  apiAppId: process.env.REACT_APP_JETS_APP_ID,
  apiKey: process.env.REACT_APP_JETS_PRIVATE_KEY,
  colorTheme: {
    deckLabelTitleColor: 'white',
    deckHeightSpacing: 100,
    wingsWidth: 50,
    deckSeparation: 0,
    floorColor: 'rgb(30,60,90)',
    seatLabelColor: 'white',
    seatStrokeColor: 'rgb(237, 237, 237)',
    seatStrokeWidth: 1,
    seatArmrestColor: '#cccccc',
    notAvailableSeatsColor: 'lightgray',
    bulkBaseColor: 'dimgrey',
    bulkCutColor: 'lightgrey',
    bulkIconColor: 'darkslategray',
    defaultPassengerBadgeColor: 'darkred',
    fontFamily: 'Montserrat, sans-serif',
    tooltipBackgroundColor: 'rgb(255,255,255)',
    tooltipHeaderColor: '#4f6f8f',
    tooltipBorderColor: 'rgb(255,255,255)',
    tooltipFontColor: '#4f6f8f',
    tooltipIconColor: '#4f6f8f',
    tooltipIconBorderColor: '#4f6f8f',
    tooltipIconBackgroundColor: '#fff',
    tooltipSelectButtonTextColor: '#fff',
    tooltipSelectButtonBackgroundColor: 'rgb(42, 85, 128)',
    tooltipCancelButtonTextColor: '#fff',
    tooltipCancelButtonBackgroundColor: 'rgb(55, 55, 55)',
    deckSelectorStrokeColor: '#fff',
    deckSelectorFillColor: 'rgba(55, 55, 55, 0.5)',
    deckSelectorSize: 25,
    fuselageStrokeWidth: 16,
    fuselageFillColor: 'lightgrey',
    fuselageStrokeColor: 'darkgrey',
    fuselageWindowsColor: 'darkgrey',
    fuselageWingsColor: 'rgba(55, 55, 55, 0.5)',
    exitIconUrlLeft: 'https://panorama.quicket.io/icons/exit-left.svg',
    exitIconUrlRight: 'https://panorama.quicket.io/icons/exit-right.svg',
  },
};

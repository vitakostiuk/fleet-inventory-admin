export interface Device {
  id: string;
  serial: string;
  model: 'Front' | 'Precision Run' | 'Curve';
  status: 'online' | 'offline' | 'maintenance';
  lastAccess: string;
}

export interface Location {
  locationId: string;
  location: string;
  city: string;
  state: string;
  devices: Device[];
}

export interface Client {
  client: string;
  locations: Location[];
}

const models: Device['model'][] = ['Front', 'Precision Run', 'Curve'];
const statuses: Device['status'][] = ['online', 'online', 'online', 'offline', 'maintenance'];

function makeDevice(seed: number): Device {
  return {
    id: `dev-${seed}`,
    serial: `WD-${(10000 + seed).toString()}`,
    model: models[seed % models.length],
    status: statuses[seed % statuses.length],
    lastAccess: `2026-07-${(10 + (seed % 10)).toString().padStart(2, '0')} ${(8 + (seed % 12)).toString().padStart(2, '0')}:0${seed % 6}`,
  };
}

export const inventory: Client[] = [
  {
    client: 'Equinox',
    locations: [
      {
        locationId: 'eq-club-14',
        location: 'Club #14',
        city: 'Austin',
        state: 'TX',
        devices: [1, 2, 3, 4].map(makeDevice),
      },
      {
        locationId: 'eq-club-27',
        location: 'Club #27',
        city: 'Denver',
        state: 'CO',
        devices: [5, 6, 7].map(makeDevice),
      },
      {
        locationId: 'eq-club-03',
        location: 'Club #03',
        city: 'Chicago',
        state: 'IL',
        devices: [8, 9, 10, 11, 12].map(makeDevice),
      },
    ],
  },
  {
    client: 'Lifetime Fitness',
    locations: [
      {
        locationId: 'lt-plano',
        location: 'Plano Athletic',
        city: 'Plano',
        state: 'TX',
        devices: [13, 14, 15].map(makeDevice),
      },
      {
        locationId: 'lt-eden-prairie',
        location: 'Eden Prairie',
        city: 'Eden Prairie',
        state: 'MN',
        devices: [16, 17].map(makeDevice),
      },
    ],
  },
  {
    client: 'Woodway Corporate HQ',
    locations: [
      {
        locationId: 'hq-demo-floor',
        location: 'Demo Floor',
        city: 'Waukesha',
        state: 'WI',
        devices: [18, 19].map(makeDevice),
      },
    ],
  },
];

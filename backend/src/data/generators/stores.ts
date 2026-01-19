import { Store } from '../../types';

// 10 NZ retail stores across different regions
export const stores: Store[] = [
  {
    id: 'STR-001',
    name: 'Auckland CBD Flagship',
    region: 'Auckland',
    type: 'flagship',
  },
  {
    id: 'STR-002',
    name: 'Newmarket Mall',
    region: 'Auckland',
    type: 'mall',
  },
  {
    id: 'STR-003',
    name: 'Wellington Central',
    region: 'Wellington',
    type: 'standard',
  },
  {
    id: 'STR-004',
    name: 'Christchurch Riccarton',
    region: 'Canterbury',
    type: 'mall',
  },
  {
    id: 'STR-005',
    name: 'Hamilton Centre',
    region: 'Waikato',
    type: 'standard',
  },
  {
    id: 'STR-006',
    name: 'Tauranga Bayfair',
    region: 'Bay of Plenty',
    type: 'mall',
  },
  {
    id: 'STR-007',
    name: 'Dunedin Meridian',
    region: 'Otago',
    type: 'standard',
  },
  {
    id: 'STR-008',
    name: 'Queenstown Express',
    region: 'Otago',
    type: 'express',
  },
  {
    id: 'STR-009',
    name: 'North Shore Westfield',
    region: 'Auckland',
    type: 'mall',
  },
  {
    id: 'STR-010',
    name: 'Palmerston North Plaza',
    region: 'Manawatu',
    type: 'standard',
  },
];

export function getStoreById(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}

export function getStoresByRegion(region: string): Store[] {
  return stores.filter((s) => s.region === region);
}

export function getRandomStore(): Store {
  return stores[Math.floor(Math.random() * stores.length)];
}

export function getRandomStores(count: number): Store[] {
  const shuffled = [...stores].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, stores.length));
}

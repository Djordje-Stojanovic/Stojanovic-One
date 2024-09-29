// src/lib/constants/listNames.ts
export const listNames = [
  'Watchlist',
  'Due Diligence',
  'Buy Ready',
  'Too Expensive',
  'Pass For Now',
  'Permanent Pass',
  'Core Holdings',
  'Regular Review',
  'Sell Ready',
  'Sold'
] as const;

export type ListName = typeof listNames[number];
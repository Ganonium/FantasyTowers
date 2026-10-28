import type { MapDef } from '../types';
import { greenvale } from './greenvale';

export const MAPS: Record<string, MapDef> = {
  [greenvale.id]: greenvale,
};

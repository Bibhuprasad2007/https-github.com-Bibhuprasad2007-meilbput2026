import React from 'react';
import { Droplet, Leaf, Users2 } from 'lucide-react';
import { TunnelIcon, HydrocarbonIcon, ManufacturingIcon } from '../components/ui/SectorIcons';

export interface SectorItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SECTORS: SectorItem[] = [
  {
    id: 'water',
    name: 'Water & Irrigation',
    icon: Droplet,
  },
  {
    id: 'transport',
    name: 'Transport & Tunnels',
    icon: TunnelIcon,
  },
  {
    id: 'power',
    name: 'Power & Renewables',
    icon: Leaf,
  },
  {
    id: 'hydrocarbons',
    name: 'Hydrocarbons',
    icon: HydrocarbonIcon,
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: ManufacturingIcon,
  },
  {
    id: 'social',
    name: 'Social Infrastructure',
    icon: Users2,
  },
];

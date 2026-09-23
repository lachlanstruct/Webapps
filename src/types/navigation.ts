export interface NavItem {
  id: string;
  title: string;
  status: 'active' | 'coming_soon';
  category: string;
  description?: string;
  badge?: string;
}

export interface NavCategory {
  id: string;
  title: string;
  items: NavItem[];
}

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    items: [
      {
        id: 'footing-overturning',
        title: 'Cantilever Wall Overturning',
        status: 'active',
        category: 'Foundations',
        description: 'Overturning stability ratio of cantilever wall & footing strip',
        badge: 'v1.0',
      },
    ],
  },
  {
    id: 'beams',
    title: 'Beams',
    items: [
      {
        id: 'beam-reactions',
        title: 'Beam Reactions',
        status: 'coming_soon',
        category: 'Beams',
        description: 'Simply supported & continuous beam reactions',
      },
      {
        id: 'partial-udl',
        title: 'Partial UDL & Point Loads',
        status: 'coming_soon',
        category: 'Beams',
        description: 'Multi-load superposition & deflection envelope',
      },
    ],
  },
  {
    id: 'loads',
    title: 'Loads',
    items: [
      {
        id: 'tributary-area',
        title: 'Tributary Area',
        status: 'coming_soon',
        category: 'Loads',
        description: 'Column & wall area distribution calculations',
      },
      {
        id: 'wind-load',
        title: 'Wind Load Generator',
        status: 'coming_soon',
        category: 'Loads',
        description: 'Pressure coefficient and terrain multiplier estimator',
      },
    ],
  },
  {
    id: 'roof-trusses',
    title: 'Roof / Trusses',
    items: [
      {
        id: 'hip-rafter',
        title: 'Hip Truss / Rafter Analysis',
        status: 'active',
        category: 'Roof / Trusses',
        description: 'Tributary area, triangular loading, moments, shears & reactions for hip rafters/trusses',
        badge: 'NEW',
      },
      {
        id: 'girder-truss-reactions',
        title: 'Girder Truss Reactions',
        status: 'coming_soon',
        category: 'Roof / Trusses',
        description: 'Point load transfer from incoming secondary trusses',
      },
    ],
  },
];

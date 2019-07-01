
'use strict';

module.exports = [
  {
    name: 'social_groups_percent',
    type: 'array',
    rows: [
      ['u2018-1', 'Achuar'],
      ['u2018-2', 'Andoas'],
      ['u2018-3', 'Huaoranis'],
      ['u2018-4', 'Kichwas'],
      ['u2018-5', 'Shiwiar'],
      ['u2018-6', 'Shuar'],
      ['u2018-7', 'Zapara'],
    ],
  },
  {
    name: 'gdp_breakdown_percent',
    type: 'array',
    rows: [
      ['u2018-1', 'Accommodation and meals activities'],
      ['u2018-2', 'Building'],
      ['u2018-3', 'Commerce'],
      ['u2018-4', 'Exploitation of mines and quarries'],
      ['u2018-5', 'Others'],
      ['u2018-6', 'Public administration'],
      ['u2018-7', 'Teaching'],
      ['u2018-8', 'Transportation, information and communications'],
    ],
    otherId: 'u2018-5',
  },
  {
    name: 'current_forest_area_typologies',
    type: 'array',
    rows: [
      ['u2018-1', 'Agriculture'],
      ['u2018-2', 'Forest'],
      ['u2018-3', 'Other'],
      ['u2018-4', 'Shrubby Vegetation'],
      ['u2018-5', 'Urban Zones'],
      ['u2018-6', 'Wetlands'],
    ],
    otherId: 'u2018-3',
  },
  {
    name: 'forest_management',
    type: 'array',
    rows: [
      ['u2018-2', 'Other'],
      ['u2018-1', 'Protected areas'],
    ],
    otherId: 'u2018-2',
  },
];

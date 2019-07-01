
'use strict';

module.exports = [
  {
    name: 'social_groups_percent',
    type: 'array',
    rows: [
      ['a1', 'Multi-ethnic'],
      ['a2', 'White'],
      ['a3', 'Black'],
      ['a4', 'Indigenous'],
      ['a6', 'Other'],
    ],
    otherId: 'a6',
  },
  {
    name: 'gdp_breakdown_percent',
    type: 'array',
    rows: [
      ['a1',
        [
          ['en', 'Services'],
          ['es', 'Servicios'],
          ['id', 'Jasa'],
          ['pt', 'Serviços'],
        ],
      ],
      ['a2',
        [
          ['en', 'Agriculture, Forestry'],
          ['es', 'Agricultura, Silvicultura'],
          ['id', 'Pertanian, Kehutanan'],
          ['pt', 'Agricultura, silvicultura'],
        ],
      ],
      ['a4',
        [
          ['en', 'Industry'],
          ['es', 'Industria'],
          ['id', 'Industri'],
          ['pt', 'Indústria'],
        ],
      ],
      ['a5',
        [
          ['en', 'Mining'],
          ['es', 'Minería'],
          ['id', 'Pertambangan'],
          ['pt', 'Mineração'],
        ],
      ],
    ],
  },
  {
    name: 'current_forest_area_typologies',
    type: 'array',
    rows: [
      ['u2017a',
        [
          ['en', 'Agriculture'],
          ['es', 'Agricultura'],
          ['id', 'Pertanian'],
          ['pt', 'Agricultura'],
        ],
      ],
      ['u2017b',
        [
          ['en', 'Forest'],
          ['es', 'Bosque'],
          ['id', 'Hutan'],
          ['pt', 'Floresta'],
        ],
      ],
      ['u2017c',
        [
          ['en', 'Pastureland'],
          ['es', 'Pastizal'],
          ['id', 'Pastureland'],
          ['pt', 'Pastagem'],
        ],
      ],
      ['u2017d',
        [
          ['en', 'Secondary Vegetation'],
          ['es', 'Vegetación secundaria'],
          ['id', 'Vegetasi Sekunder'],
          ['pt', 'Vegetação Secundária'],
        ],
      ],
      ['u2017e',
        [
          ['en', 'Other Land Uses'],
          ['es', 'Otros usos de la tierra'],
          ['id', 'Penggunaan lahan lainnya'],
          ['pt', 'Outros usos do solo'],
        ],
      ],
    ],
    otherId: 'u2017e',
  },
  {
    name: 'forest_management',
    type: 'array',
    rows: [
      ['u2017a',
        [
          ['en', 'Protected'],
          ['es', 'Protegido'],
          ['id', 'Terlindung'],
          ['pt', 'Protegido'],
        ],
      ],
      ['u2017b',
        [
          ['en', 'Unprotected'],
          ['es', 'Desprotegido'],
          ['id', 'Tak terlindung'],
          ['pt', 'Desprotegido'],
        ],
      ],
    ],
  },
  {
    name: 'deforestationReferenceYear',
    type: 'array',
    rows: [
    ],
  },

];

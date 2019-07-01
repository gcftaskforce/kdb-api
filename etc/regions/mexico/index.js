'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'mexico',
  name: 'Mexico',
  geoId: 'MX',
  navColumn: 2,
  currency: 'MXN',
  lang: 'es',
  fields: [
    {
      name: 'national_social_groups_percent',
      rows: [
        ['a1', 'Mestizo'],
        ['a8', 'Indigenous'],
        ['a9', [
          ['en', 'Other'],
          ['es', 'Otro'],
          ['id', 'Lain'],
          ['pt', 'De outros']],
        ],
      ],
      otherId: 'a9',
    }, {
      name: 'national_gdp_breakdown_percent',
      rows: [
        ['a1', [
          ['en', 'Agriculture,Forestry'],
          ['es', 'Agricultura, Silvicultura'],
          ['id', 'Pertanian, Kehutanan'],
          ['pt', 'Agricultura, silvicultura']],
        ],
        ['a2', [
          ['en', 'Industry, Mining'],
          ['es', 'Industria, Minería'],
          ['id', 'Industri, Pertambangan'],
          ['pt', 'Indústria, Mineração']],
        ],
        ['a3', [
          ['en', 'Services'],
          ['es', 'Servicios'],
          ['id', 'Jasa'],
          ['pt', 'Serviços']],
        ],
      ],
    },
  ],
  jurisdictions,
};

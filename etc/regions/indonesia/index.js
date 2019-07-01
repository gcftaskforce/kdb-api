'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'indonesia',
  name: 'Indonesia',
  geoId: 'ID',
  navColumn: 1,
  currency: 'IDR',
  lang: 'id',
  fields: [{
    name: 'national_gdp_breakdown_percent',
    type: 'array',
    rows: [
      ['a1', [
        ['en', 'Agriculture, Livestock, Forestry & Fisheries'],
        ['es', 'Agricultura, Ganadería, Silvicultura y Pesca'],
        ['id', 'Pertanian, Peternakan, Kehutanan & Perikanan'],
        ['pt', 'Agricultura, pecuária, silvicultura e pesca']],
      ],
      ['a2', [
        ['en', 'Mining & Quarrying'],
        ['es', 'Minería y Excavación'],
        ['id', 'Pertambangan & penggalian'],
        ['pt', 'Minas e pedreiras']],
      ],
      ['a3', [
        ['en', 'Processing Industry'],
        ['es', 'Industria de procesos'],
        ['id', 'Industri pengolahan'],
        ['pt', 'Indústria de processamento']],
      ],
      ['a4', [
        ['en', 'Construction'],
        ['es', 'Construcción'],
        ['id', 'Konstruksi'],
        ['pt', 'Construção']],
      ],
      ['a5', [
        ['en', 'Trade, Hotel & Restaurant'],
        ['es', 'Comercio, Hotel y Restaurante'],
        ['id', 'Perdagangan, Hotel & Restoran'],
        ['pt', 'Trade, Hotel & Restaurant']],
      ],
      ['a6', [
        ['en', 'Transport & Communication'],
        ['es', 'Transporte y comunicación'],
        ['id', 'Transportasi & Komunikasi'],
        ['pt', 'Transporte e comunicação']],
      ],
      ['a7', [
        ['en', 'Services'],
        ['es', 'Servicios'],
        ['id', 'Jasa'],
        ['pt', 'Serviços']],
      ],
    ],
  }],
  jurisdictions,
};

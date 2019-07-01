'use strict';

/**
 * Note that summary data is manipulated and returned with each item in the form:
 *  [pathName, Object]
 *  where pathName is a unique identifier and Object contains key/value pairs
 */

const debug = require('debug')('api:calculations');

const models = require('./models');

const { listRegionIds, getNamespace, findLabelTranslation } = require('./lib');
const REGION_DEFS = require('./etc/regions');
const FIELD_DEFS = require('./etc/field-defs');
const LANGS = require('./etc/langs');

const DERIVED_FIELD_DEFS = (FIELD_DEFS.filter(d => d.isDerived));

const ALL_REGION_IDS = listRegionIds(REGION_DEFS);
const SEPARATOR = '-';

/** NATION_COUNT and JURISDICTION_COUNT are needed in summary data (final calculations) */
let NATION_COUNT = 0;
let JURISDICTION_COUNT = 0;
REGION_DEFS.forEach((nation) => {
  NATION_COUNT += 1;
  JURISDICTION_COUNT += (nation.jurisdictions || []).length;
});
/** Start with the global totals (they're used in summary data)
 * and push nationCount and jurisdictionCount
*/
const GLOBALS = require('./etc/global-data');

GLOBALS.push({
  id: 'value-nationCount-global',
  name: 'nationCount',
  type: 'value',
  namespace: 'global',
  amount: NATION_COUNT,
  string: String(NATION_COUNT),
});
GLOBALS.push({
  id: 'value-jurisdictionCount-global',
  name: 'jurisdictionCount',
  type: 'value',
  namespace: 'global',
  amount: JURISDICTION_COUNT,
  string: String(JURISDICTION_COUNT),
});

/** Set up a LABELS object keyed on language */
const LABELS = {};
LANGS.forEach((lang) => { LABELS[lang] = []; });
FIELD_DEFS.concat(GLOBALS).forEach((fieldDef) => {
  const units = fieldDef.units || '';
  const path = `${fieldDef.type}-${fieldDef.name}-${fieldDef.namespace}`;
  LANGS.forEach((lang) => {
    LABELS[lang].push([path, findLabelTranslation(fieldDef.labels || fieldDef.label, fieldDef.name, lang), units]);
  });
});
// literal list of fields used in derivations
// TODO: loop through the contexts and auto-extract the encountered field references
const DEPENDENT_FIELDS = [
  'value-tropicalForestArea-global',
  'value-tropicalForestCarbonStocks-global',
  'array-national_deforestation_rate-national',
  'value-national_population-national',
  'value-original_forest_area-jurisdictional',
  'value-forestArea-jurisdictional',
  'value-land_area-jurisdictional',
  'value-forestCarbon-jurisdictional',
  'array-deforestation_rates-jurisdictional',
  'value-population-jurisdictional',
];
/** All derivations use either Value or Array types
 * Break out the dependent fields by type for easy finds in the context getter */
const VALUE_FIELD_NAMES = DEPENDENT_FIELDS.filter((f) => {
  const segments = f.split(SEPARATOR);
  return ((segments[2] !== 'global') && (segments[0] === 'value'));
}).map(f => f.split(SEPARATOR)[1]);

const ARRAY_FIELD_NAMES = DEPENDENT_FIELDS.filter((f) => {
  const segments = f.split(SEPARATOR);
  return ((segments[2] !== 'global') && (segments[0] === 'array'));
}).map(f => f.split(SEPARATOR)[1]);

/** Build the context argument available to each derived field in the callback get(context) */
const getContext = (dependents, regionId) => {
  const [nationId] = regionId.split('.');
  /** "methods" available in the callback via the context argument */
  const get = (genericPath) => {
    const segments = genericPath.split('-');
    const specificPath = [segments[0], segments[1], segments[2].replace('national', nationId).replace('jurisdictional', regionId)].join('-');
    const dependent = dependents.find(d => (d[0] === specificPath));
    if (!dependent) return null;
    return dependent[1];
  };
  const getAmount = (genericPath) => {
    const entity = get(genericPath);
    if (!entity) return null;
    return entity.amount || null;
  };
  const getRows = (genericPath) => {
    const entity = get(genericPath);
    if (!entity) return [];
    return entity.rows || [];
  };
  const calcPercent = (arg1, arg2) => {
    const result = { amount: null, year: '', currency: '' };
    const amount1 = getAmount(arg1);
    const amount2 = getAmount(arg2);
    if ((amount1 === null) || (amount2 === null)) return result;
    if (amount2 === 0) return result;
    result.amount = 100 * amount1 / amount2;
    return result;
  };
  const calcDifference = (arg1 = null, arg2 = null) => {
    const result = { amount: null, year: '', currency: '' };
    const amount1 = getAmount(arg1);
    const amount2 = getAmount(arg2);
    if ((amount1 === null) || (amount2 === null)) return result;
    result.amount = amount1 - amount2;
    return result;
  };
  const calcSum = (arg1 = null, arg2 = null) => {
    const result = { amount: null, year: '', currency: '' };
    const amount1 = getAmount(arg1);
    const amount2 = getAmount(arg2);
    if ((amount1 === null) || (amount2 === null)) return result;
    result.amount = amount1 + amount2;
    return result;
  };
  const calcTotal = (arg = null) => {
    const result = { amount: 0, year: '', currency: '' };
    const segments = arg.split(SEPARATOR);
    const requestedNamespace = getNamespace(segments[2]);
    const filteredDependents = dependents.filter((d) => {
      const fSegments = d[0].split(SEPARATOR);
      if ((fSegments[0] !== segments[0])) return false;
      if ((fSegments[1] !== segments[1])) return false;
      return (getNamespace(fSegments[2]) === requestedNamespace);
    });
    filteredDependents.forEach((dependent) => {
      if (dependent[1] === null) return;
      result.amount += (dependent[1].amount || 0);
    });
    return result;
  };
  const calcTrend = (arg = null) => {
    const result = { amount: null, year: '', currency: '' };
    const rows = getRows(arg);
    for (let i = rows.length - 1; i > 1; i -= 1) {
      const row1 = rows[i - 1];
      const row2 = rows[i];
      if ((row1.amount !== null) && (row2.amount !== null)) {
        if (row1.amount) {
          result.amount = 100 * (row2.amount - row1.amount) / row1.amount;
          result.year = row2.id; // display final year only
        }
        break;
      }
    }
    return result;
  };
  return {
    get,
    calcPercent,
    calcDifference,
    calcSum,
    calcTotal,
    calcTrend,
  };
};

const save = async (summaryData) => {
  const derivedFieldPaths = DERIVED_FIELD_DEFS.map(d => `${d.type}-${d.name}-${d.namespace}`);
  const derivedAmounts = [];
  summaryData.forEach((datum) => {
    const segments = datum[0].split('-');
    const id = [segments[0], segments[1], getNamespace(segments[2])].join('-');
    if (derivedFieldPaths.includes(id)) derivedAmounts.push([datum[0], datum[1]]);
  });
  const promises = derivedAmounts.map(([id, rec]) => {
    const entity = {
      amount: rec.amount || null,
      year: rec.year || '',
      currency: rec.currency || '',
    };
    return models.value.updateEntity(entity, id);
  });
  return Promise.all(promises);
};

const get = async () => {
  /** Build the array of summary data and include the calculation results for derived fields */
  // 1 include the dependents
  const valueEntities = await models.value.dump(VALUE_FIELD_NAMES);
  const arrayEntities = await models.array.dump(ARRAY_FIELD_NAMES);
  const globalEntities = GLOBALS.filter(g => (!g.isDerived));
  // const values = valueEntities.map(e => [e.id, e.amount]);
  // const arrays = arrayEntities.map(e => [e.id, e.rows]);
  // const globals = globalEntities.map(g => [`${g.type}-${g.name}-global`, g.amount]);
  // const summaryData = values.concat(arrays, globals);
  let summaryEntities = valueEntities.map(e => [e.id, { amount: e.amount, year: e.year, currency: e.currency }]);
  summaryEntities = summaryEntities.concat(arrayEntities.map(e => [e.id, { rows: e.rows }]));
  summaryEntities = summaryEntities.concat(globalEntities.map(e => [e.id, { amount: e.amount }]));
  // summaryEntities.forEach((e) => {
  //   debug(e);
  // });
  // 2 include the calculations for each region
  ALL_REGION_IDS.forEach((regionId) => {
    const namespace = getNamespace(regionId);
    DERIVED_FIELD_DEFS.filter(d => (d.namespace === namespace)).forEach((fieldDef) => {
      const path = `${fieldDef.type}-${fieldDef.name}-${regionId}`;
      if (typeof fieldDef.get !== 'function') return;
      const result = fieldDef.get(getContext(summaryEntities, regionId));
      summaryEntities.push([path, result]);
    });
  });
  // 3 include the summary totals
  GLOBALS.filter(fieldDef => (fieldDef.isDerived)).forEach((fieldDef) => {
    if (typeof fieldDef.get !== 'function') return;
    const path = `${fieldDef.type}-${fieldDef.name}-global`;
    const result = fieldDef.get(getContext(summaryEntities, 'global'));
    summaryEntities.push([path, result]);
  });
  return summaryEntities;
};

module.exports = {
  get,
  save,
  GLOBALS,
  LABELS,
};

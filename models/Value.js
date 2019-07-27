'use strict';

const debug = require('debug')('api:model:Value');
const get = require('lodash.get');

const createError = require('http-errors');

const formatAmount = require('../lib/format-amount');
const isValidAmount = require('../lib/is-valid-amount');
const parseAmount = require('../lib/parse-amount');
const findLabelTranslation = require('../lib/find-label-translation');

const Model = require('./__Model');

const ENTITY_DEF = {
  kind: 'Value',
  properties: [
    {
      name: 'id',
      type: 'id',
    }, {
      name: 'fieldName',
      type: 'fieldName',
    }, {
      name: 'regionId',
      type: 'regionId',
    }, {
      name: 'timestamp',
      type: 'timestamp',
    }, {
      name: 'citation',
      type: 'citation',
      isIndexed: false,
    }, {
      name: 'amount',
      type: 'number',
    }, {
      name: 'year',
    }, {
      name: 'currency',
    }, {
      name: 'string',
      default: '',
      get: (srcEntity = {}, instance) => { return formatAmount(srcEntity.amount, get(instance, 'fieldDef.formatOptions')); },
    }, {
      name: 'label',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(get(instance, 'fieldDef.labels'), get(instance, 'lang'), 'en'); },
    }, {
      name: 'units',
      default: '',
      get: (srcEntity, instance) => { return get(instance, 'fieldDef.units', ''); },
    }, {
      name: 'isDerived',
      default: false,
      get: (srcEntity, instance) => { return Boolean(get(instance, 'fieldDef.isDerived')); },
    }, {
      name: 'subType',
      default: '',
      get: (srcEntity, instance) => { return get(instance, 'fieldDef.subType', ''); },
    },
  ],
};

class ValueModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }

  // sanitize submission before passing it on
  updateEntity(srcSubmission, id, lang) {
    // const submission = copyObjectProperties(srcSubmission);
    const sanitizedSubmission = { amount: null, year: '', currency: '' };
    const submissionKeys = Object.keys(srcSubmission);
    if (submissionKeys.includes('amount')) {
      if (!isValidAmount(srcSubmission.amount)) throw new createError.BadRequest('"amount" must be a valid number or null (indicating missing)');
      sanitizedSubmission.amount = srcSubmission.amount;
    } else if (submissionKeys.includes('string')) {
      // submission may include a (formatted) string, in which case 'amount' must be parsed and validated
      if (typeof srcSubmission.string !== 'string') throw new createError.BadRequest('"string" must be of type string'); // available to client
      const amount = parseAmount(srcSubmission.string);
      if (Number.isNaN(amount)) throw new createError.BadRequest(`The entry "${srcSubmission.string}" is not a valid number`); // available to client
      sanitizedSubmission.amount = amount;
    } else {
      // neither 'value' nor 'string' was supplied
      throw new createError.BadRequest('submission must include one of the following properties: "amount" (a valid Number type) or "string" (a string representation of a number)');
    }
    // check 'year' and 'currency' (they're optional)
    if (submissionKeys.includes('year')) {
      if (typeof srcSubmission.year !== 'string') throw new createError.BadRequest('"year" must be of type string');
      sanitizedSubmission.year = srcSubmission.year;
    }
    if (submissionKeys.includes('currency')) {
      if (typeof srcSubmission.currency !== 'string') throw new createError.BadRequest('"currency" must be of type string');
      sanitizedSubmission.currency = srcSubmission.currency;
    }
    return super.updateEntity(sanitizedSubmission, id, lang);
  }
}

module.exports = ValueModel;

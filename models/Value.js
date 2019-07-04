'use strict';

const debug = require('debug')('api:model:Value');
const _ = require('lodash');
const createError = require('http-errors');

const copyObjectProperties = require('../lib/copy-object-properties');
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
      type: 'text',
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
      get: (srcEntity = {}, instance) => { return formatAmount(srcEntity.amount, _.get(instance, 'fieldDef.formatOptions')); },
    }, {
      name: 'label',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(_.get(instance, 'fieldDef.labels'), _.get(instance, 'lang'), 'en'); },
    }, {
      name: 'units',
      default: '',
      get: (srcEntity, instance) => { return _.get(instance, 'fieldDef.units', ''); },
    }, {
      name: 'isDerived',
      default: false,
      get: (srcEntity, instance) => { return Boolean(_.get(instance, 'fieldDef.isDerived')); },
    }, {
      name: 'subType',
      default: '',
      get: (srcEntity, instance) => { return _.get(instance, 'fieldDef.subType', ''); },
    },
  ],
};

class ValueModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }

  // sanitize submission before passing it on
  updateEntity(srcSubmission, id, lang) {
    const submission = copyObjectProperties(srcSubmission);
    if (submission.amount !== undefined) {
      if (!isValidAmount(submission.amount)) throw new createError.BadRequest('"amount" must be a valid number or null (indicating missing)');
    } else {
      if (submission.string === undefined) throw new createError.BadRequest('submission must include one of the following properties: "amount" (a valid Number type) or "string" (a string representation of a number)');
      if (typeof submission.string !== 'string') throw new createError.BadRequest('"string" must be of type string'); // available to client
      const amount = parseAmount(submission.string);
      if (Number.isNaN(amount)) throw new createError.BadRequest(`unable to parse submitted "string" (${submission.string}) into a number`); // available to client
      submission.amount = amount;
      delete submission.string;
    }
    return super.updateEntity(submission, id, lang);
  }
}

module.exports = ValueModel;

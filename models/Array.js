const debug = require('debug')('api:model:Array');
const _ = require('lodash');
const createError = require('http-errors');

const isValidAmount = require('../lib/is-valid-amount');
const findLabelTranslation = require('../lib/find-label-translation');
const copyObjectProperties = require('../lib/copy-object-properties');
const parseAmount = require('../lib/parse-amount');

const Model = require('./__Model');
const remapArrayRows = require('../lib/remap-array-rows');

const ENTITY_DEF = {
  kind: 'Array',
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
      name: 'rows',
      type: 'array',
      isIndexed: false,
    }, {
      name: 'rows',
      default: [],
      get: (submission = {}, instance) => {
        return remapArrayRows(submission.rows, _.get(instance, 'fieldDef'), _.get(instance, 'lang'));
      },
    }, {
      name: 'label',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(_.get(instance, 'fieldDef.labels'), _.get(instance, 'lang'), 'en'); },
    }, {
      name: 'units',
      default: '',
      get: (srcEntity, instance) => { return _.get(instance, 'fieldDef.units', ''); },
    }, {
      name: 'categoryLabel',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(_.get(instance, 'fieldDef.categoryLabels'), _.get(instance, 'lang'), 'en'); },
    },
  ],
};

class ArrayModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }

  // sanitize submission before passing it on
  updateEntity(srcSubmission, id, lang) {
    const submission = copyObjectProperties(srcSubmission);
    if (!Array.isArray(submission.rows)) throw new createError.BadRequest('submission must include a "rows" property of type Array');
    const rows = submission.rows.map((row) => {
      if (typeof row.id !== 'string') throw new createError.BadRequest('each submission row must include an "id" property of type string');
      let { amount } = row;
      if (amount === undefined) {
        // there must be a string property
        if (row.string === undefined) throw new createError.BadRequest('each submission row must include one of the following properties: "amount" (a valid Number type) or "string" (a string representation of a number)');
        amount = parseAmount(row.string);
        if (Number.isNaN(amount)) throw new createError.BadRequest(`unable to parse submitted "string" (${row.string}) into a number`); // available to client
      } else if (!isValidAmount(amount)) {
        throw new createError.BadRequest('"amount" must be a valid number or null (indicating missing)');
      }
      return { id: row.id, amount };
    });
    return super.updateEntity(Object.assign(submission, { rows }), id, lang);
  }
}

module.exports = ArrayModel;

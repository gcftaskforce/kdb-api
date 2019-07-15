const debug = require('debug')('api:model:Contact');
const get = require('lodash.get');

const Model = require('./__Model');

const findLabelTranslation = require('../lib/find-label-translation');

const ENTITY_DEF = {
  kind: 'Contact',
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
      name: 'firstName',
    }, {
      name: 'lastName',
    }, {
      name: 'email',
    }, {
      name: 'companyTitle',
    }, {
      name: 'fullName',
      get: (submission = {}) => { return `${(submission.firstName || '').trim()} ${(submission.lastName || '').trim()}`.trim(); },
    }, {
      name: 'label',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(get(instance, 'fieldDef.labels'), get(instance, 'lang'), 'en'); },
    },
  ],
};

class ContactModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }
}

module.exports = ContactModel;

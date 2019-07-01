const debug = require('debug')('api:model:Contact');
const _ = require('lodash');

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
      isSubmitted: true,
    }, {
      name: 'lastName',
      isSubmitted: true,
    }, {
      name: 'email',
      isSubmitted: true,
    }, {
      name: 'companyTitle',
      isSubmitted: true,
    }, {
      name: 'fullName',
      get: (submission = {}) => { return `${(submission.firstName || '').trim()} ${(submission.lastName || '').trim()}`.trim(); },
    }, {
      name: 'label',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(_.get(instance, 'fieldDef.labels'), _.get(instance, 'lang'), 'en'); },
    },
  ],
};

class ContactModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }
}

module.exports = ContactModel;

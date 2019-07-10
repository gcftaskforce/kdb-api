'use strict';

const debug = require('debug')('api:model:Text');
const _ = require('lodash');

const findLabelTranslation = require('../lib/find-label-translation');

const Model = require('./__Model');

const ENTITY_DEF = {
  kind: 'Framework',
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
      name: 'timestamps',
      type: 'timestamps',
    }, {
      name: 'citation',
      type: 'text',
      isIndexed: false,
    }, {
      name: 'text',
      type: 'text',
      isIndexed: false,
      isTranslated: true,
    }, {
      name: 'lang',
      default: '',
      get: (srcEntity) => { return srcEntity.lang || ''; },
    }, {
      name: 'label',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(_.get(instance, 'fieldDef.labels'), _.get(instance, 'lang'), 'en'); },
    },
  ],
};

class FrameworkModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }
}

module.exports = FrameworkModel;

'use strict';

const debug = require('debug')('api:model:Text');
const { get } = require('lodash');

const findLabelTranslation = require('../lib/find-label-translation');

const Model = require('./__Model');

const ENTITY_DEF = {
  kind: 'Text',
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
      name: 'label',
      default: '',
      get: (srcEntity, instance) => { return findLabelTranslation(get(instance, 'fieldDef.labels'), get(instance, 'lang'), 'en'); },
    },
  ],
};

class TextModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }
}

module.exports = TextModel;

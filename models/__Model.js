'use strict';

const debug = require('debug')('api:Model');
const { has } = require('lodash');
const createError = require('http-errors');
const { Datastore } = require('@google-cloud/datastore');

const copyObjectProperties = require('../lib/copy-object-properties');
const findTextTranslation = require('../lib/find-text-translation');
const findRegionDefinition = require('../lib/find-region-definition');
const getLabelLookup = require('../lib/get-label-lookup');
const getNewTimestamp = require('../lib/get-new-timestamp');
const getUpdatedTimestamps = require('../lib/get-updated-timestamps');

const ALL_FIELD_DEFS = require('../etc/field-defs');
const ALL_REGION_DEFS = require('../etc/regions');

const LANGS = require('../etc/langs');

/**
 * these "types" CANNOT be changed through update submissions
 * structured as [type. default]
 */

const INTERNAL_TYPES = [
  'id',
  'fieldName',
  'regionId',
  'nationId',
  'citation',
  'jurisdictionId',
  'timestamp',
  'timestamps',
  'lang',
];

const ds = new Datastore();

const getDefaultValue = (type, params = {}) => {
  // check if type belongs to INTERNAL_TYPES
  if (INTERNAL_TYPES.includes(type)) {
    if (type === 'id') {
      if (params.id) return params.id;
      // try to build id from fieldName and regionId
      if (!(params.fieldName && params.regionId)) throw new Error('ARGUMENT_ERROR: either "id" or "fieldName" and "regionId" must be specified.');
      return `${this.FIELD_TYPE}-${params.fieldName}-${params.regionId}`;
    }
    if (type === 'regionId') {
      if (params.regionId) return params.regionId;
      // try to extract regionId from the id
      if (!params.id) {
        throw new Error('ARGUMENT_ERROR: Unable to determine "regionId". Ether a valid "id" or "regionId" must be specified.');
      }
      const idSegments = params.id.split('-');
      // id is of the form fieldType-fieldName-regionId
      if (!idSegments[2]) throw new Error('ARGUMENT_ERROR: Unable to determine "regionId" from given "id".');
      return idSegments[2];
    }
    if (type === 'nationId') {
      if (params.nationId) return params.nationId;
      // try to extract nationId from the id
      if (!params.id) {
        throw new Error('ARGUMENT_ERROR: Unable to determine "nationId". Ether a valid "id" or "nationId" must be specified.');
      }
      const idSegments = params.id.split('-');
      // id is of the form fieldType-fieldName-regionId
      if (!idSegments[2]) throw new Error('ARGUMENT_ERROR: Unable to determine "regionId" from given "id".');
      return idSegments[2];
    }
    if (type === 'fieldName') {
      if (params.fieldName) return params.fieldName;
      // try to extract fieldName from the id
      if (!params.id) {
        throw new Error('ARGUMENT_ERROR: Unable to determine "fieldName". Ether a valid "id" or "fieldName" must be specified.');
      }
      const idSegments = params.id.split('-');
      // id is of the form fieldType-fieldName-regionId
      if (!idSegments[1]) throw new Error('ARGUMENT_ERROR: Unable to determine "fieldName" from given "id".');
      return idSegments[1];
    }
    if (type === 'timestamps') {
      return [];
    }
    return ''; // default to empty string
  }
  // this is a data type
  if (type === 'array') return [];
  if (type === 'list') return [];
  if (type === 'number') return null;
  return ''; // default is just empty string
};

class Model {
  constructor(ENTITY_DEF) {
    this.ENTITY_KIND = ENTITY_DEF.kind;
    this.FIELD_TYPE = ENTITY_DEF.kind.toLowerCase();
    this.ENTITY_PROPERTIES = ENTITY_DEF.properties || [];
    this.FIELD_DEFS = ALL_FIELD_DEFS.filter(d => (d.type === this.FIELD_TYPE)) || [];
    // exclude from indexes
    this.EXCLUDE_FROM_INDEXES = [];
    this.ENTITY_PROPERTIES.filter(p => (p.isIndexed === false)).forEach((property) => {
      if (property.isTranslated) {
        LANGS.forEach((lang) => {
          this.EXCLUDE_FROM_INDEXES.push(`${property.name}-${lang}`);
        });
      } else {
        this.EXCLUDE_FROM_INDEXES.push(property.name);
      }
    });
    // extract labels
    this.ENTITY_LABELS = [];
    this.ENTITY_PROPERTIES.forEach((p) => {
      if (p.labels) this.ENTITY_LABELS.push({ name: p.name, labels: p.labels });
    });
  }

  copyTranslatedEntityProperties(srcEntity = {}, context = {}) {
    const entity = {};
    // process non-derived properties first
    this.ENTITY_PROPERTIES.forEach((propertyDef) => {
      const propertyName = propertyDef.name;
      const propertyType = propertyDef.type || 'string';
      if (typeof propertyDef.get === 'function') {
        // use callback for derived properties
        entity[propertyName] = propertyDef.get(srcEntity, context);
        return;
      }
      if (propertyDef.isTranslated) {
        const { text, lang } = findTextTranslation(srcEntity, propertyName, context.lang, 'en');
        // include (actual) lang
        entity[propertyName] = text;
        entity.lang = lang;
      } else {
        entity[propertyName] = has(srcEntity, propertyName) ? srcEntity[propertyName] : getDefaultValue(propertyType, context);
      }
    });
    return entity;
  }

  createRecordFromEntity(srcEntity, context, labelLookup) {
    const record = {};
    this.ENTITY_PROPERTIES.forEach((propertyDef) => {
      const propertyName = propertyDef.name;
      const propertyType = propertyDef.type || 'string';
      if (INTERNAL_TYPES.includes(propertyType)) {
        // internal types are not labeled or translated
        record[propertyName] = has(srcEntity, propertyName) ? srcEntity[propertyName] : getDefaultValue(propertyType, context);
        return;
      }
      record[propertyName] = {};
      record[propertyName].label = labelLookup[propertyName] || '';
      if (typeof propertyDef.get === 'function') {
        // use callback for derived properties
        record[propertyName][propertyType] = propertyDef.get(srcEntity, context);
        return;
      }
      if (propertyDef.isTranslated) {
        const { text, lang } = findTextTranslation(srcEntity, propertyName, context.lang, 'en');
        // include (actual) lang
        record[propertyName][propertyType] = text;
        record[propertyName].lang = lang;
      } else {
        record[propertyName][propertyType] = has(srcEntity, propertyName) ? srcEntity[propertyName] : getDefaultValue(propertyType, context);
      }
    });
    return record;
  }

  async find(id, lang) {
    const idSegments = id.split('-');
    const fieldName = idSegments[1] || '';
    const regionId = idSegments[2] || '';
    const regionDef = findRegionDefinition(ALL_REGION_DEFS, regionId);
    if (!regionDef) throw new Error(`NOT_FOUND: id "${id}" includes an invalid region segment ("${regionId}")`);
    const dsQuery = ds.createQuery(this.ENTITY_KIND).filter('id', '=', id);
    let entity;
    try {
      const results = await ds.runQuery(dsQuery);
      if (results[0].length) {
        [[entity]] = results;
      }
    } catch (err) {
      throw err;
    }
    if (this.FIELD_DEFS.length) {
      // FIELD DEFS were defined for this kind - rec is build from field definition (REQUIRED) with properties assigned from entity (OPTIONAL)
      // find the field definition for this id
      let fieldDef = this.FIELD_DEFS.find(f => (f.name === fieldName));
      if (!fieldDef) throw new Error(`NOT_FOUND: no field definition found for fieldName "${fieldName}"`);
      // field definitions can also be defined by the region - if one is found, its properties are merged in
      if (Array.isArray(regionDef.fields)) {
        const regionLevelFieldDef = regionDef.fields.find(f => (f.name === fieldName));
        if (regionLevelFieldDef) fieldDef = copyObjectProperties(fieldDef, regionLevelFieldDef);
      }
      const context = {
        fieldDef,
        fieldName: fieldDef.name,
        regionDef,
        regionId,
        id,
        lang,
      };
      entity = this.copyTranslatedEntityProperties(entity, context);
      return entity;
    }
    // FIELD DEFS were not defined for this kind - rec is build from entity (REQUIRED)
    if (!entity) throw new Error(`NOT_FOUND: no data found for id "${id}"`);
    const context = {
      regionDef, regionId, id, lang,
    };
    // entity = this.copyTranslatedEntityProperties(entity, context);
    const labelLookup = getLabelLookup(this.ENTITY_LABELS, lang, 'en');
    return this.createRecordFromEntity(entity, context, labelLookup);
  }

  async filter(regionId, lang) {
    const regionDef = findRegionDefinition(ALL_REGION_DEFS, regionId);
    if (!regionDef) throw new Error(`NOT_FOUND: regionId "${regionId}" not found`);
    const regionLevelFieldDefs = regionDef.fields || [];
    const regionSegments = regionId.split('.');
    const namespace = (regionSegments.length === 1) ? 'national' : 'jurisdictional';
    const filterPropertyName = (this.ENTITY_PROPERTIES.find(p => (p.type === 'regionId')) || {}).name || 'regionId';
    const filterPropertyValue = (filterPropertyName === 'nationId') ? regionSegments[0] : regionId;
    const dsQuery = ds.createQuery(this.ENTITY_KIND).filter(filterPropertyName, '=', filterPropertyValue);
    let entities = [];
    try {
      const results = await ds.runQuery(dsQuery);
      if (results[0].length) {
        [entities] = results;
      }
    } catch (err) {
      throw err;
    }
    if (filterPropertyName === 'nationId' && regionSegments[1] && this.ENTITY_PROPERTIES.find(p => (p.name === 'jurisdictions'))) {
      entities = entities.filter(e => (Array.isArray(e.jurisdictions) && e.jurisdictions.includes(regionSegments[1])));
    }
    const data = [];
    if (this.FIELD_DEFS.length) {
      this.FIELD_DEFS.filter(f => (f.namespace === namespace)).forEach((genericFieldDef) => {
        const regionLevelFieldDef = regionLevelFieldDefs.find(f => (f.name === genericFieldDef.name));
        const fieldDef = (regionLevelFieldDef) ? copyObjectProperties(genericFieldDef, regionLevelFieldDef) : genericFieldDef;
        let entity = entities.find(e => (e.fieldName === fieldDef.name));
        const context = {
          fieldDef,
          fieldName: fieldDef.name,
          regionDef,
          lang,
          regionId,
        };
        entity = this.copyTranslatedEntityProperties(entity, context);
        data.push(entity);
      });
      return data;
    }
    const records = [];
    const context = {
      regionDef,
      lang,
      regionId,
    };
    const labelLookup = getLabelLookup(this.ENTITY_LABELS, lang, 'en');
    entities.forEach((srcEntity) => {
      const entity = this.createRecordFromEntity(srcEntity, Object.assign({ id: srcEntity.id }, context), labelLookup);
      records.push(entity);
      // records.push(this.createRecordFromEntity(entity, labelLookup));
    });
    return records;
  }

  getDefaultEntity(params) {
    const entity = {};
    this.ENTITY_PROPERTIES.forEach((propertyDef) => {
      if (propertyDef.isTranslated) {
        LANGS.forEach((lang) => {
          const propertyTranslationName = `${propertyDef.name}-${lang}`;
          entity[propertyTranslationName] = getDefaultValue(propertyDef.type, params);
        });
      } else {
        entity[propertyDef.name] = getDefaultValue(propertyDef.type, params);
      }
    });
    return entity;
  }

  async update(submission, params = {}) {
    const { id, lang, propertyName } = params;
    const idSegments = id.split('-');
    const regionId = idSegments[2] || '';
    const regionDef = findRegionDefinition(ALL_REGION_DEFS, regionId);
    if (!regionDef) throw new Error(`NOT_FOUND: id "${id}" includes an invalid region segment ("${regionId}")`);
    let data;
    let key;
    const dsQuery = ds.createQuery(this.ENTITY_KIND).filter('id', '=', id);
    try {
      const results = await ds.runQuery(dsQuery);
      if (results[0].length) {
        [[data]] = results;
      }
    } catch (err) {
      throw err;
    }
    if (data) {
      // there is an existing entity, just get the existing key
      key = data[ds.KEY];
    } else {
      // create a new default entity (and key)
      key = ds.key([this.ENTITY_KIND, id]);
      data = this.getDefaultEntity({ id, regionId });
    }
    Object.entries(submission).forEach(([submittedPropertyName, submittedPropertyValue]) => {
      data[submittedPropertyName] = submittedPropertyValue;
    });
    // update timestamp/timestamps
    if (propertyName !== 'citation') {
      // don't update timestamp(s) for citation updates
      if (has(data, 'timestamp')) data.timestamp = getNewTimestamp(propertyName, lang);
      if (has(data, 'timestamps')) {
        data.timestamps = getUpdatedTimestamps(data.timestamps, data.timestamp);
      }
    }
    const entity = {
      key,
      data,
      excludeFromIndexes: this.EXCLUDE_FROM_INDEXES,
    };
    try {
      await ds.save(entity);
    } catch (err) {
      throw err;
    }
    data = await this.find(id, lang);
    return data;
  }

  async updateEntity(submission, id) {
    if (!(submission instanceof Object)) throw new Error('ARGUMENT_ERROR: "submission" must be an Object with a with key/value pairs corresponding to the fields to be updated.');
    if (submission.citation !== undefined) throw new Error('ARGUMENT_ERROR: "submission" cannot include a "citation" property - use the "updateCitation" method instead');
    // build array of property names being submitted
    const submittedFieldList = Object.keys(submission).sort().join('\n');
    // build array of permitted property names (not derived and not an internal type)
    const permittedFieldList = this.ENTITY_PROPERTIES.filter((p) => {
      if (p.get) return false; // exclude derived fields
      return (!INTERNAL_TYPES.includes(p.type)); // exclude internal types
    }).map(p => p.name).sort().join('\n');
    if (submittedFieldList !== permittedFieldList) throw new Error(`ARGUMENT_ERROR: "submission" must include the following properties and no others:\n ${permittedFieldList}`);
    const checkedAndClonedSubmission = {};
    Object.entries(submission).forEach(([submittedPropertyName, submittedPropertyValue]) => {
      checkedAndClonedSubmission[submittedPropertyName] = submittedPropertyValue;
    });
    return this.update(checkedAndClonedSubmission, { id });
  }

  async updateEntityProperty(submission, id) {
    if (!(submission instanceof Object)) throw new Error('ARGUMENT_ERROR: "submission" must be an Object with a with key/value pairs corresponding to the fields to be updated.');
    if (submission.citation !== undefined) throw new Error('ARGUMENT_ERROR: "submission" cannot include a "citation" property - use the "updateCitation" method instead');
    const submittedPropertyList = Object.keys(submission);
    if (submittedPropertyList.length !== 1) throw new Error('ARGUMENT_ERROR: "submission" must include exactly one property for update');
    const propertyName = submittedPropertyList[0];
    const propertyDef = this.ENTITY_PROPERTIES.find(p => (p.name === propertyName));
    if (propertyDef === undefined) throw new Error(`ARGUMENT_ERROR: property name "${propertyName}" is not defined`);
    if (propertyDef.get) throw new Error(`ARGUMENT_ERROR: property name "${propertyName}" is derived and cannot be updated`);
    if (INTERNAL_TYPES.includes(propertyDef.type)) throw new Error(`ARGUMENT_ERROR: property name "${propertyName}" is an internal type and cannot be updated`);
    const checkedAndClonedSubmission = {};
    checkedAndClonedSubmission[propertyName] = submission[propertyName];
    return this.update(checkedAndClonedSubmission, { id, propertyName });
  }

  async updateCitation(submission, id) {
    if (!this.ENTITY_PROPERTIES.find(p => (p.name === 'citation'))) throw new createError.MethodNotAllowed(`'${this.ENTITY_KIND}' doesn't support 'updateCitation'`);
    if (!(submission instanceof Object)) throw new Error('ARGUMENT_ERROR: submission must be an Object with string property "citation".');
    const submittedPropertyList = Object.keys(submission);
    if ((submittedPropertyList.length !== 1) || (submittedPropertyList[0] !== 'citation')) throw new Error('ARGUMENT_ERROR: "submission" must include exactly one property named "citation"');
    if (typeof submission.citation !== 'string') throw new Error('ARGUMENT_ERROR: submission must be an Object with string property "citation".');
    return this.update({ citation: submission.citation }, { id, propertyName: 'citation' });
  }

  async updateTranslation(submission, lang, id) {
    if (!(submission instanceof Object)) throw new Error('ARGUMENT_ERROR: submission must be an Object with a string property corresponding to the field to be updated.');
    const submittedPropertyList = Object.keys(submission);
    if (submittedPropertyList.length !== 1) throw new Error('ARGUMENT_ERROR: submission must have exactly one property corresponding to the field to be updated');
    const propertyName = submittedPropertyList[0];
    const entityProperty = this.ENTITY_PROPERTIES.find(p => (p.name === propertyName));
    if (!entityProperty) throw new Error(`ARGUMENT_ERROR: property '${propertyName}' is not defined for '${this.ENTITY_KIND}'`);
    if (!entityProperty.isTranslated) throw new Error(`ARGUMENT_ERROR: property '${propertyName}' is not translated`);
    if (typeof lang !== 'string') throw new Error('ARGUMENT_ERROR: "lang" argument is required and must be a string');
    if (!LANGS.includes(lang)) throw new Error(`ARGUMENT_ERROR: "lang" ${lang} is not supported`);
    const checkedAndClonedSubmission = {};
    // translated properties are named as "propertyName-ll" where ll is the ISO-639-1 lang code
    checkedAndClonedSubmission[`${propertyName}-${lang}`] = submission[propertyName];
    return this.update(checkedAndClonedSubmission, { id, lang, propertyName });
  }

  async delete(id) {
    const dsQuery = ds.createQuery(this.ENTITY_KIND).filter('id', '=', id);
    let entity;
    try {
      const results = await ds.runQuery(dsQuery);
      if (results[0].length) {
        [[entity]] = results;
      }
    } catch (err) {
      throw err;
    }
    if (!entity) return false;
    const key = entity[ds.KEY];
    await ds.delete(key);
    return true;
  }

  async dump(fieldNames) {
    const dsQuery = ds.createQuery(this.ENTITY_KIND);
    let entities = [];
    try {
      const results = await ds.runQuery(dsQuery);
      if (results[0].length) {
        [entities] = results;
      }
      if (Array.isArray(fieldNames)) entities = entities.filter(e => fieldNames.includes(e.fieldName));
    } catch (err) {
      throw err;
    }
    return entities;
  }
}

module.exports = Model;

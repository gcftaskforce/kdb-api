'use strict';

const debug = require('debug')('api:model:Partnership');
const _ = require('lodash');
const uniqid = require('uniqid');
const createError = require('http-errors');

const Model = require('./__Model');

const getMappedJurisdictions = (jurisdictionDefs, jurisdictionMemberSlugs = []) => {
  const jurisdictions = [];
  if (!Array.isArray(jurisdictionDefs)) return jurisdictions;
  jurisdictionDefs.forEach((jurisdictionDef) => {
    jurisdictions.push({
      id: jurisdictionDef.id,
      slug: jurisdictionDef.slug,
      name: jurisdictionDef.name,
      shortName: jurisdictionDef.shortName || '',
      isMember: jurisdictionMemberSlugs.includes(jurisdictionDef.slug),
    });
  });
  return jurisdictions;
};

const ENTITY_DEF = {
  kind: 'Partnership',
  labels: [
    ['en', 'Current Partnerships and Initiatives'],
    ['es', 'Asociaciones e iniciativas actuales'],
    ['id', 'Kemitraan dan Inisiatif Saat Ini'],
    ['pt', 'Parcerias e Iniciativas Atuais'],
    ['fr', 'Partenariats et initiatives actuels'],
  ],
  properties: [
    {
      name: 'id',
      type: 'id',
    }, {
      name: 'fieldName',
      type: 'fieldName',
    }, {
      name: 'nationId', /* Note that partnerships use "nationId" instead of "regionId" */
      type: 'regionId',
    }, {
      name: 'timestamp',
      type: 'timestamp',
    }, {
      name: 'timestamps',
      type: 'timestamps',
    }, {
      name: 'name',
      isTranslated: true,
      isIndexed: false,
      labels: 'Name',
    }, {
      name: 'link',
      isTranslated: false,
      isIndexed: false,
      labels: 'Link',
    }, {
      name: 'description',
      isTranslated: true,
      isIndexed: false,
      type: 'text',
      labels: [
        ['en', 'Description'],
        ['es', 'Descripción'],
        ['id', 'Deskripsi'],
        ['pt', 'Descrição'],
        ['fr', 'La description'],
      ],
    }, {
      name: 'jurisdictions',
      isTranslated: false,
      type: 'list', /** array of strings */
    }, {
      name: 'partners',
      isTranslated: true,
      isIndexed: false,
      type: 'text',
      labels: [
        ['en', 'Partners'],
        ['es', 'Socios'],
        ['id', 'Mitra'],
        ['pt', 'Parceiros'],
        ['fr', 'Les partenaires'],
      ],
    }, {
      name: 'fundingSource',
      isTranslated: true,
      isIndexed: false,
      type: 'text',
      labels: [
        ['en', 'Funding Source'],
        ['es', 'Fuente de financiamiento'],
        ['id', 'Sumber Pendanaan'],
        ['pt', 'Fonte de financiamento'],
        ['fr', 'Source de financement'],
      ],
    }, {
      name: 'fundingAmount',
      isTranslated: true,
      isIndexed: false,
      type: 'text',
      labels: [
        ['en', 'Funding Amount'],
        ['es', 'Importe de financiación'],
        ['id', 'Jumlah dana'],
        ['pt', 'Montante de Financiamento'],
        ['fr', 'Montant du financement'],
      ],
    }, {
      name: 'initiativeType',
      isTranslated: true,
      type: 'text',
      isIndexed: false,
      labels: [
        ['en', 'Initiative Type'],
        ['es', 'Tipo de Iniciativa'],
        ['id', 'Jenis inisiatif'],
        ['pt', 'Tipo de Iniciativa'],
        ['fr', 'Type d\'initiative'],
      ],
    }, {
      name: 'initiativeStatus',
      isTranslated: true,
      isIndexed: false,
      type: 'text',
      labels: [
        ['en', 'Initiative Status'],
        ['es', 'Estado de Iniciativa'],
        ['id', 'Status Inisiatif'],
        ['pt', 'Status da iniciativa'],
        ['fr', 'Statut de l\'initiative'],
      ],
    }, {
      name: 'jurisdictionalMembership',
      type: 'array', /** derived convenience property */
      default: [],
      labels: [
        ['en', 'Jurisdictions'],
        ['es', 'Jurisdicciones'],
        ['id', 'Yurisdiksi'],
        ['pt', 'Jurisdições'],
        ['fr', 'Juridictions'],
      ],
      get: (srcEntity, instance) => {
        return getMappedJurisdictions(_.get(instance, 'regionDef.memberJurisdictions'), srcEntity.jurisdictions);
      },
    },
  ],
};

class PartnershipModel extends Model {
  constructor() {
    super(ENTITY_DEF);
  }

  async filter(regionId, lang) {
    // sort Partnerships by name
    const filteredPartnerships = await super.filter(regionId, lang);
    return filteredPartnerships.sort((a, b) => {
      const nameA = _.get(a, 'name.string', '').toUpperCase();
      const nameB = _.get(b, 'name.string', '').toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }

  async insert(submission, regionId, lang = 'en') {
    if (!((submission instanceof Object) && (typeof submission.name === 'string'))) {
      throw new createError.BadRequest('"submission" must be an Object with a "name" property specifying the name of the Partnership.');
    }
    if (typeof regionId !== 'string') {
      throw new createError.BadRequest('"regionId" argument is required.');
    }
    const uid = uniqid();
    const [nationId, jurisdictionSlug] = regionId.split('.');
    const newId = `partnership-${uid}-${nationId}-${uid}`;
    let newPartnership = await this.updateTranslation(submission, lang, newId);
    if (jurisdictionSlug) {
      newPartnership = await this.updateEntityProperty({ jurisdictions: [jurisdictionSlug] }, newId);
    }
    return newPartnership;
  }
}

module.exports = PartnershipModel;

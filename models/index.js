'use strict';

const debug = require('debug')('api:models');

const ValueModel = require('./Value');
const TextModel = require('./Text');
const FrameworkModel = require('./Framework');
const ContactModel = require('./Contact');
const ArrayModel = require('./Array');
const PartnershipModel = require('./Partnership');

const models = {};
models.value = new ValueModel();
models.text = new TextModel();
models.framework = new FrameworkModel();
models.contact = new ContactModel();
models.array = new ArrayModel();
models.partnership = new PartnershipModel();

module.exports = models;

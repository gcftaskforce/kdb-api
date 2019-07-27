'use strict';

const debug = require('debug')('api:app');
const path = require('path');
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
// const logger = require('morgan');
const redis = require('redis');
const ExpressSession = require('express-session');
const RedisStore = require('connect-redis')(ExpressSession);

const { copyPrimitives, getKindFromId } = require('./lib');

const summaryData = require('./summary-data');
const translation = require('./translation');

let SUMMARY_DATA = [];
const MODELS_THAT_INVOKE_RECALCULATION = ['value', 'array']; /** summary data must be updated when any of these are updated  */

const { LABELS } = summaryData;

// keep a copy of current summary data
// TODO: store this in REDIS!
summaryData.get().then((data) => {
  SUMMARY_DATA = data;
});

const models = require('./models');

const LANGS = require('./etc/langs');
const REGIONS = require('./etc/regions');
const ROUTES_THAT_404 = require('./etc/routes-that-404');

const authMiddleware = require('./middleware/auth');

const { SESSION_NAME, SESSION_SECRET } = process.env; /** these are necessary for authenticating users to access the CMS */
/**
  check for SESSION_NAME and SESSION_SECRET in .env and issue a warning if unavailable
*/
if (!(SESSION_NAME && SESSION_SECRET)) {
  debug('APP_SETUP_WARNING: the environment variables SESSION_NAME and SESSION_SECRET must be set--no users will have access to POST routes.');
}
const REGION_DEFS = copyPrimitives(REGIONS, 'jurisdictions');

const ENV = {
  langs: LANGS,
  env: process.env.NODE_ENV,
  version: process.env.npm_package_version,
  isEmulator: Boolean(process.env.DATASTORE_EMULATOR_HOST_PATH),
};

const app = express();

/**
  Set up Redis/Express session store
*/

const SESSION_TTL = 12 * 3600;
if (SESSION_NAME && SESSION_SECRET) {
  app.use(ExpressSession({
    store: new RedisStore({
      client: redis.createClient(),
      ttl: SESSION_TTL,
      logErrors: true,
    }),
    secret: SESSION_SECRET,
    name: SESSION_NAME,
    saveUninitialized: false,
    unset: 'destroy',
    resave: true,
  }));
}

/*
  Middleware
*/

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*
  Routes
*/

app.use(ROUTES_THAT_404, (req, res) => {
  res.status(404).end();
});

// Disallow Robots
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

app.get('/json/region-defs.json', async (req, res) => {
  res.json({ env: ENV, regionDefs: REGION_DEFS });
});

app.get('/json/summary-data.json', async (req, res) => {
  res.json({ recs: SUMMARY_DATA });
});

app.get('/json/summary-data-:lang.json', async (req, res) => {
  const { lang } = req.params;
  if (lang && LABELS[lang]) res.json({ recs: SUMMARY_DATA, labels: LABELS[lang] });
  else res.status(404).end();
});

app.get('/json/labels-:lang.json', async (req, res) => {
  const { lang } = req.params;
  if (lang && LABELS[lang]) res.json({ labels: LABELS[lang] });
  else res.status(404).end();
});

/**
 * Public API (GET)
 */

app.get('/json/:filename', async (req, res, next) => {
  const [
    collectionName, regionId, lang,
  ] = path.basename(req.params.filename, '.json').split('-');
  const data = {
    env: ENV,
  };
  try {
    switch (collectionName) {
      case 'data':
        data.value = await models.value.filter(regionId, lang);
        data.array = await models.array.filter(regionId, lang);
        data.contact = await models.contact.filter(regionId, lang);
        data.text = await models.text.filter(regionId, lang);
        res.json(data);
        break;
      case 'framework':
        data.framework = await models.framework.filter(regionId, lang);
        res.json(data);
        break;
      case 'partnership':
        data.partnership = await models.partnership.filter(regionId, lang);
        res.json(data);
        break;
      default:
        next();
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Private API (POST)
 */

app.use(authMiddleware);

app.post('/translate', async (req, res, next) => {
  const methodName = 'translate';
  const {
    id,
    propertyName,
    fromLang,
    toLang,
    type,
  } = req.query;
  const [propertyBaseName, propertyType] = (propertyName || '').split('.');
  const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  // we'll be using updateTranslation() to re-save the translated text
  if (typeof model.updateTranslation !== 'function') {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  let data = await model.find(id, fromLang);
  const fromText = (propertyType) ? data[propertyBaseName][propertyType] : data[propertyBaseName];
  const isString = (type === 'string') || (propertyType === 'string');
  let toText = '';
  try {
    toText = await translation.translate(fromText, fromLang, toLang, isString);
  } catch (err) {
    next(err);
    return;
  }
  // re-save the translation
  try {
    // build submission using propertyName
    const submission = {};
    submission[propertyBaseName] = toText;
    data = await model.updateTranslation(submission, toLang, id, { isGoogle: true });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/get', async (req, res, next) => {
  const methodName = 'get';
  const {
    id, lang,
  } = req.query;
  const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  let data = {};
  // note that models use a find() method
  if (typeof model.find !== 'function') {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  try {
    data = await model.find(id, lang);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/updateTranslation', async (req, res, next) => {
  const methodName = 'updateTranslation';
  const {
    id, lang,
  } = req.query;
  const submission = req.body || {};
  const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  let data = {};
  if (typeof model.updateTranslation !== 'function') {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  try {
    data = await model.updateTranslation(submission, lang, id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/updateEntity', async (req, res, next) => {
  const methodName = 'updateEntity';
  const submission = req.body || {};
  const {
    id, lang,
  } = req.query;
  const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  let data = {};
  if (typeof model.updateEntity !== 'function') {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  try {
    data = await model.updateEntity(submission, id, lang);
    // update derived values
    if (MODELS_THAT_INVOKE_RECALCULATION.includes(modelName)) {
      SUMMARY_DATA = await summaryData.get();
      await summaryData.save(SUMMARY_DATA);
    }
  } catch (err) {
    next(err);
    return;
  }
  res.json(data);
});

app.post('/updateEntityProperty', async (req, res, next) => {
  const methodName = 'updateEntityProperty';
  const submission = req.body || {};
  const {
    id, lang,
  } = req.query;
  const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  /** this is only used by the Partnership model to update individual non-text properties */
  if (typeof model.updateEntityProperty !== 'function') {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  let data = {};
  try {
    data = await model.updateEntityProperty(submission, id, lang);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/updateCitation', async (req, res, next) => {
  const methodName = 'updateEntity';
  const submission = req.body || {};
  const {
    id, lang,
  } = req.query;
  const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  let data = {};
  if (typeof model.updateCitation !== 'function') {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  try {
    data = await model.updateCitation(submission, id, lang);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post('/delete', async (req, res, next) => {
  const methodName = 'delete';
  const {
    id,
  } = req.query;
  const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  let data = {};
  // only allow deletion of partnership (it doesn't make sense for anything else)
  if (!((modelName === 'partnership') && (typeof model.delete === 'function'))) {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  data = await model.delete(id);
  res.json(data);
});

app.post('/insert', async (req, res, next) => {
  const methodName = 'insert';
  const submission = req.body || {};
  const {
    regionId, modelName, lang,
  } = req.query;
  // const modelName = getKindFromId(id);
  const model = models[modelName];
  // for unsupported model - pass the request to the next route
  if (model === undefined) {
    next();
    return;
  }
  let data = {};
  // only allow insertion of partnership (it doesn't make sense for anything else)
  if (!((modelName === 'partnership') && (typeof model.insert === 'function'))) {
    next(new createError.MethodNotAllowed(`'${modelName}' doesn't support ${methodName}`));
    return;
  }
  try {
    data = await model.insert(submission, regionId, lang);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// just 404 any unhandled routes
app.use((req, res) => {
  res.status(404).end();
});

// error handler (non 404s)
app.use((err, req, res, next) => {
  debug('The app caught the following error:');
  debug(err.status, err.message);
  res.status(err.status || 500).send(err.message || 'Server Error');
});

module.exports = app;

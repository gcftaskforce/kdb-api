'use strict';

const debug = require('debug')('api:translate');

const { Translate } = require('@google-cloud/translate');

const translateClient = new Translate({ projectId: process.env.GOOGLE_PROJECT_ID });

const translate = async (text, from, to) => {
  let translatedText = '';
  try {
    const translations = await translateClient.translate(text, { format: 'html', from, to });
    [translatedText] = translations;
  } catch (err) {
    debug(err);
  }
  return translatedText;
};

module.exports = { translate };

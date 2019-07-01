'use strict';

module.exports = (jurisdictions, jurisdictionalFields) => {
  if (!Array.isArray(jurisdictions)) return;
  if (!Array.isArray(jurisdictionalFields)) return;
  jurisdictions.forEach((jurisdiction) => {
    if (!jurisdiction.fields) jurisdiction.fields = jurisdictionalFields;
    else jurisdiction.fields = jurisdiction.fields.concat(jurisdictionalFields);
  });
};

'use strict';

const formatAmount = require('./format-amount');
const findLabelTranslation = require('./find-label-translation');

const getRowStats = (rows = []) => {
  const stats = {
    isComplete: undefined,
    total: 0,
    max: 0,
    min: Number.MAX_VALUE,
    hasValues: false,
  };
  rows.forEach((row) => {
    if ([undefined, null].includes(row.amount) || Number.isNaN(Number(row.amount))) {
      stats.isComplete = false;
      return;
    }
    stats.hasValues = true;
    stats.total += row.amount;
    stats.max = (row.amount > stats.max) ? row.amount : stats.max;
    stats.min = (row.amount < stats.min) ? row.amount : stats.min;
  });
  if (stats.isComplete === undefined) stats.isComplete = true;
  return stats;
};

const getPercent = (amount) => {
  return Math.round(amount * 1000) / 10;
};

module.exports = (submissionRows = [], field = {}, lang = 'en') => {
  const stats = getRowStats(submissionRows);
  const remappedRows = [];
  const sortedIdList = submissionRows.filter(r => (r.amount !== null))
    .sort((a, b) => {
      if (a.amount === b.amount) return 0;
      if (a.amount === null) return 1;
      if (b.amount === null) return -1;
      if (a.amount > b.amount) return -1;
      return 1;
    })
    .map(r => r.id) || [];
  // console.log(sortedIdList);
  (field.rows || []).forEach((rowDef) => {
    if (!Array.isArray(rowDef)) return;
    const id = String(rowDef[0]);
    const label = findLabelTranslation(rowDef[1], lang);
    let amount = null;
    if (rowDef[2] !== undefined) amount = rowDef[2]; // amount may be specified in row definition (which takes precedence)
    if (amount === null) {
      const submissionRow = submissionRows.find(r => (String(r.id) === id));
      if (submissionRow) ({ amount } = submissionRow);
    }
    const orderIndex = sortedIdList.includes(id) ? sortedIdList.indexOf(id) : null;
    remappedRows.push({
      id,
      amount,
      orderIndex,
      string: formatAmount(amount, field.formatOptions),
      percent: (stats.total) ? getPercent(amount / stats.total) : 0,
      percentOfMax: (stats.max) ? getPercent(amount / stats.max) : 0,
      label,
    });
  });
  return remappedRows;
};

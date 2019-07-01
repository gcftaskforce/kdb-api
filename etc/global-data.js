module.exports = [{
  id: 'value-tropicalForestArea-global',
  name: 'tropicalForestArea',
  type: 'value',
  namespace: 'global',
  units: 'km²',
  amount: 14287108,
  string: '14,287,108',
  citation: 'ESA GlobCover 2009 Project',
}, {
  id: 'value-tropicalForestCarbonStocks-global',
  name: 'tropicalForestCarbonStocks',
  type: 'value',
  namespace: 'global',
  units: 'MtC',
  amount: 158973,
  string: '158,973',
  citation: 'Baccini, A. et al. 2012. Estimated carbon dioxide emissions from tropical deforestation improved by carbon-density maps. Nature Climate Change 2:182-185; doi:10.1038/nclimate1354',
}, {
  id: 'value-forestAreaTotalGCF-global',
  name: 'forestAreaTotalGCF',
  type: 'value',
  namespace: 'global',
  units: 'km²',
  isDerived: true,
  get: (context) => {
    return context.calcTotal('value-forestArea-jurisdictional');
  },
}, {
  id: 'value-forestCarbonTotalGCF-global',
  name: 'forestCarbonTotalGCF',
  type: 'value',
  namespace: 'global',
  units: 'MtC',
  isDerived: true,
  get: (context) => {
    return context.calcTotal('value-forestCarbon-jurisdictional');
  },
}, {
  id: 'value-forestAreaTotalPercentGCF-global',
  name: 'forestAreaTotalPercentGCF',
  type: 'value',
  namespace: 'global',
  units: '%',
  isDerived: true,
  get: (context) => {
    return context.calcTotal('value-forestAreaPercentOfGlobal-jurisdictional');
  },
}, {
  id: 'value-forestCarbonTotalPercentGCF-global',
  name: 'forestCarbonTotalPercentGCF',
  type: 'value',
  namespace: 'global',
  units: '%',
  isDerived: true,
  get: (context) => {
    return context.calcTotal('value-carbonPercentOfGlobal-jurisdictional');
  },
}];

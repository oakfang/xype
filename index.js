const { getTypeByLabel, ...utils } = require('./type-utils');
const meta = require('./meta');
const { reflectIntoCompoundType, ...compound } = require('./compound');
const primitives = require('./primitives');
const match = require('./match');

module.exports = Object.assign({}, utils, meta, compound, primitives, match);

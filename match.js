const { isinstance } = require("./type-utils");
const { _reflect } = require('./compound');
const { fn: Fn } = require("./primitives");
const { type: Type } = require("./meta");

const getCallable = fn => (isinstance(fn, Fn) ? fn : () => fn);

module.exports = function match(type, value) {
  const matchers = [{ type: _reflect(type), value: getCallable(value) }];
  function _match(val) {
    for (const { type, value } of matchers) {
      if (!type || isinstance(val, type)) return value(val);
    }
  }
  _match.match = (type, value) => {
    matchers.push({ type: type !== undefined && _reflect(type), value: getCallable(value) });
    return _match;
  };
  _match.otherwise = value => _match.match(undefined, value);
  return _match;
};

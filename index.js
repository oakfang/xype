const isinstance = (instance, Type) => instance instanceof Type;
const typeby = predicate =>
  class {
    static [Symbol.hasInstance](instance) {
      return predicate(instance);
    }
  };

const nil = typeby(val => val == null);
const Primitive = type => typeby(val => typeof val === type);

const primitives = {
  string: Primitive("string"),
  number: Primitive("number"),
  bool: Primitive("boolean"),
  int: typeby(Number.isInteger),
  float: typeby(Number.isFinite),
  nil
};

const optional = Type =>
  typeby(
    instance =>
      isinstance(instance, Type) || isinstance(instance, primitives.nil)
  );

const record = spec =>
  class {
    static [Symbol.hasInstance](instance) {
      return (
        isinstance(instance, Primitive("object")) &&
        Object.keys(spec)
              .concat(Object.getOwnPropertySymbols(spec))
              .every(prop => isinstance(instance[prop], spec[prop]))
      );
    }
    static extended(xSpec) {
      return record(Object.assign({}, spec, xSpec));
    }
  };

const Fn = typeby(fn => typeof fn === "function");
const Type = typeby(t => typeof t === "function" || typeof t === "object");

const getCallable = fn => (isinstance(fn, Fn) ? fn : () => fn);

function match(type, value) {
  const matchers = [{ type, value: getCallable(value) }];
  function _match(val) {
    for (const { type, value } of matchers) {
      if (type && isinstance(type, Type) && isinstance(val, type)) return value(val);
      else if (type && val === type)  return value(val);
      else if (!type) return value(val);
    }
  }
  _match.match = (type, value) => {
    matchers.push({ type, value: getCallable(value) });
    return _match;
  };
  _match.otherwise = value => _match.match(null, value);
  return _match;
}

module.exports = { optional, record, match, isinstance, primitives, typeby };

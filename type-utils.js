const isinstance = (instance, Type) => instance instanceof Type;

const _typesByString = {
  [Array]: Array,
  [Error]: Error,
  [Promise]: Promise,
  [Object]: Object,
};
const typeby = predicate => {
  const label = `@@type//${Object.keys(_typesByString).length}`;
  const type = class {
    static [Symbol.hasInstance](instance) {
      return predicate(instance);
    }
    static toString() {
      return label;
    }
  };
  _typesByString[label] = type;
  return type;
};

const getTypeByLabel = label => _typesByString[label];

module.exports = { isinstance, typeby, getTypeByLabel };

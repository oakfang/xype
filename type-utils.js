const isinstance = (instance, Type) => instance instanceof Type;
const typeby = predicate =>
  class {
    static [Symbol.hasInstance](instance) {
      return predicate(instance);
    }
  };

module.exports = { isinstance, typeby };

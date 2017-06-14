const isinstance = (instance, Type) => instance instanceof Type;
const typeby = predicate => class {
    static [Symbol.hasInstance](instance) {
        return predicate(instance);
    }
};

const nil = typeby(val => val == null);
const Premitive = type => typeby(val => (typeof val) === type);

const premitives = {
    string: Premitive('string'),
    number: Premitive('number'),
    bool: Premitive('boolean'),
    nil
};

const optional = Type => typeby(instance =>
    isinstance(instance, Type) || isinstance(instance, premitives.nil)
);

const record = spec => class {
    static [Symbol.hasInstance](instance) {
        return Object.keys(spec)
                     .every(prop => isinstance(instance[prop], spec[prop]));
    }
    static extended(xSpec) {
        return record(Object.assign({}, spec, xSpec));
    }
}

function match(value, clauses) {
    for (const clause of clauses) {
        if (!Array.isArray(clause)) return clause;
        if (clause.length === 1) return clause[0];
        let [type, predicate, mapper] = clause;
        if (mapper === undefined) {
            mapper = predicate;
            predicate = () => true;
        }
        if (!(typeof type === 'function')) {
            const val = type;
            type = typeby(instance => instance === val);
        }
        if (isinstance(value, type) && predicate(value)) {
            return (typeof mapper) === 'function' ? mapper(value) : mapper; 
        }
    }
}

module.exports = { optional, record, match, isinstance, premitives, typeby };
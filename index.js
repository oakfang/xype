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

const any = typeby(() => true);

function match(clauses) {
    const matchers = clauses.map(clause => {
        if (!Array.isArray(clause)) {
            return [any, () => true, clause];
        }
        let [type, predicate, mapper] = clause;
        if (predicate === undefined) {
            return [any, () => true, type];
        }
        if (!(typeof type === 'function')) {
            const val = type;
            type = typeby(instance => instance === val);
        }
        if (mapper === undefined) {
            return [type, () => true, predicate];
        }
        return [type, predicate, mapper];
    });
    return value => {
        for (const matcher of matchers) {
            const [type, predicate, mapper] = matcher;
            if (isinstance(value, type) && predicate(value)) {
                return (typeof mapper) === 'function' ? mapper(value) : mapper; 
            }
        }
    };
}

module.exports = { optional, record, match, isinstance, premitives, typeby };
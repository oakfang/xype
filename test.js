const test = require('nefarious');
const {
  optional,
  union,
  match,
  record,
  isinstance,
  bool,
  string,
  number,
  nil,
  float,
  int,
  typeby,
  tuple,
  any,
  not,
} = require('.');

const Person = record({
  name: string,
  age: optional(number),
});

const Iterator = record({
  [Symbol.iterator]: Function,
});

const AgelessPerson = Person.extended({ age: nil });

test('primitives', t => {
  t.is(isinstance(1, number), true);
  t.is(isinstance('1', number), false);
  t.is(isinstance('foo', string), true);
  t.is(isinstance(true, string), false);
  t.is(isinstance(true, bool), true);
  t.is(isinstance(false, bool), true);
  t.is(isinstance('', bool), false);
  t.is(isinstance(null, nil), true);
  t.is(isinstance(undefined, nil), true);
  t.is(isinstance(false, nil), false);
  t.is(isinstance(1, int), true);
  t.is(isinstance(1.4, int), false);
  t.is(isinstance(1, float), true);
  t.is(isinstance('1', float), false);
  t.is(isinstance(1.4, float), true);
});

test('Optional', t => {
  const maybeNum = optional(number);
  t.is(isinstance(null, maybeNum), true);
  t.is(isinstance(undefined, maybeNum), true);
  t.is(isinstance(5, maybeNum), true);
  t.is(isinstance('5', maybeNum), false);
});

test('Records', t => {
  const p = { name: 'Foo' };
  t.is(isinstance(p, Person), true);
  t.is(isinstance(p, AgelessPerson), true);
  p.age = 4;
  t.is(isinstance(p, Person), true);
  t.is(isinstance(p, AgelessPerson), false);
  delete p.name;
  t.is(isinstance(p, Person), false);
  t.is(isinstance(p, AgelessPerson), false);
  t.is(isinstance([], Iterator), true);
  t.is(isinstance(new Set(), Iterator), true);
  t.is(isinstance(p, Iterator), false);
});

test('Match', t => {
  const isEven = match(
    {
      [int]: x => !(x % 2),
    },
    false
  );
  t.is(isEven(1), false);
  t.is(isEven(2), true);
  t.is(isEven('2'), false);

  const getAge = match({ [AgelessPerson]: '-', [Person]: ({ age }) => age });

  const p = { name: 'foo', age: 3 };
  t.is(getAge(p), 3);
  delete p.age;
  t.is(getAge(p), '-');

  const factorial = match({
    [1]: 1,
    [int]: n => n * factorial(n - 1),
  });

  t.is(factorial(3), 6);

  const EmptyArray = typeby(arr => Array.isArray(arr) && arr.length === 0);

  const tail = match(
    {
      [EmptyArray]: [],
      [Array]: arr => arr.slice(1),
    },
    []
  );
  t.is(tail([1, 2])[0], 2);
  t.is(tail(0).length, 0);

  const strictFib = match({
    0: 1,
    1: 1,
    [int](x) {
      return strictFib(x - 1) + strictFib(x - 2);
    },
  });
  t.is(strictFib(4), 5);
  t.throws(() => strictFib('foo'));
});

test('Sanitise objects via records', t => {
  const Address = record({
    city: string,
    street: string,
    house: int,
    zip: optional(string),
  });
  const User = record({
    username: string,
    address: Address,
  });
  const user = {
    username: 'foo',
    password: 'bar',
    address: {
      city: 'x',
      street: 'y',
      house: 4,
      foox: 3,
    },
  };
  t.deepEquals(User.sanitise(user), {
    username: 'foo',
    address: {
      city: 'x',
      street: 'y',
      house: 4,
    },
  });
  user.username = 4;
  t.is(User.sanitise(user), null);
});

test('Reflect entire schema', t => {
  const User = record({
    username: string,
    address: {
      city: string,
      street: string,
      house: int,
      zip: optional(union(string, int)),
    },
    comments: [
      {
        content: string,
      },
    ],
  });
  t.is(
    isinstance(
      {
        username: 'foo',
        address: {
          city: 'x',
          street: 'y',
          house: 4,
        },
        comments: [{ content: 'foo' }],
      },
      User
    ),
    true
  );
  t.is(
    isinstance(
      {
        username: 'foo',
        address: {
          city: 'x',
          street: 'y',
          house: 4,
        },
        comments: [{ contents: 'foo' }],
      },
      User
    ),
    false
  );
  t.throws(() =>
    record({
      foo: [int, string],
    })
  );
  t.is(
    isinstance(
      {
        values: [1, '2'],
      },
      record({
        values: [],
      })
    ),
    true
  );
});

test('Tuples', t => {
  const Result = tuple(int, string);
  const isResult = v => isinstance(v, Result);
  t.is(isResult([5, 'foo']), true);
  t.is(isResult([5, 'foo', 1]), false);
  t.is(isResult([5, 4]), false);
});

test('Reflection of literals', t => {
  const T = record({
    age: 34,
  });
  t.is(isinstance({ age: 34 }, T), true);
  t.is(isinstance({ age: 33 }, T), false);
});

test('Generics', t => {
  const Just = T => T;
  const Nothing = nil;
  const Maybe = T => union(Just(T), Nothing);

  // prop: (obj, p) -> Maybe(obj[p])
  const prop = match(
    p => ({
      [record({ [p]: not(nil) })]: obj => obj[p],
    }),
    null
  );
  const get = match((prop, fallback = null) => ({
    [record({ [prop]: not(nil) })]: obj => obj[prop],
    [any]: fallback,
  }));
  const user = {
    username: 'foobar',
  };
  t.is(get(user, 'username'), 'foobar');
  t.is(get(user, 'meow', 5), 5);
  t.truthy(isinstance(prop(user, 'username'), Maybe(string)));
  t.truthy(isinstance(prop(user, 'xlsd'), Maybe(string)));

  const mapMaybe = match(mapper => ({
    [Just(string)]: mapper,
    [Nothing]: null,
  }));

  t.is(mapMaybe(prop(user, 'username'), username => username.length), 6);

  const Val = V => V;
  const Err = E => E;
  const Result = (E, V) => union(Val(V), Err(E));
  const wrap = fn => (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      return e;
    }
  };
  const safeDeepProp = wrap((obj, props) =>
    props.reduce((val, p) => val[p], obj)
  );
  const hasDeepProp = (obj, props) =>
    match({
      [Err(Error)]: false,
      [Val(int)]: true,
    })(safeDeepProp(obj, props));
  t.falsy(hasDeepProp({}, ['a', 'b']));
  t.truthy(isinstance(safeDeepProp({}, ['a', 'b']), Result(Error, int)));
});

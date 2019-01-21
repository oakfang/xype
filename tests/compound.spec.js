const test = require('nefarious');
const {
  optional,
  record,
  isinstance,
  string,
  number,
  nil,
  int,
  tuple,
} = require('..');

const Person = record({
  name: string,
  age: optional(number),
});

const Iterator = record({
  [Symbol.iterator]: Function,
});

const AgelessPerson = Person.extended({ age: nil });

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

test('Tuples', t => {
  const Result = tuple(int, string);
  const isResult = v => isinstance(v, Result);
  t.is(isResult([5, 'foo']), true);
  t.is(isResult([5, 'foo', 1]), false);
  t.is(isResult([5, 4]), false);
});
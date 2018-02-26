import test from "ava";
import {
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
  typeby
} from ".";

const Person = record({
  name: string,
  age: optional(number)
});

const Iterator = record({
  [Symbol.iterator]: Function
});

const AgelessPerson = Person.extended({ age: nil });

test("primitives", t => {
  t.is(isinstance(1, number), true);
  t.is(isinstance("1", number), false);
  t.is(isinstance("foo", string), true);
  t.is(isinstance(true, string), false);
  t.is(isinstance(true, bool), true);
  t.is(isinstance(false, bool), true);
  t.is(isinstance("", bool), false);
  t.is(isinstance(null, nil), true);
  t.is(isinstance(undefined, nil), true);
  t.is(isinstance(false, nil), false);
  t.is(isinstance(1, int), true);
  t.is(isinstance(1.4, int), false);
  t.is(isinstance(1, float), true);
  t.is(isinstance("1", float), false);
  t.is(isinstance(1.4, float), true);
});

test("Optional", t => {
  const maybeNum = optional(number);
  t.is(isinstance(null, maybeNum), true);
  t.is(isinstance(undefined, maybeNum), true);
  t.is(isinstance(5, maybeNum), true);
  t.is(isinstance("5", maybeNum), false);
});

test("Records", t => {
  const p = { name: "Foo" };
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

test("Match", t => {
  const isEven = match(int, x => !(x % 2)).otherwise(false);
  t.is(isEven(1), false);
  t.is(isEven(2), true);
  t.is(isEven("2"), false);

  const getAge = match(AgelessPerson, "-").match(Person, ({ age }) => age);

  const p = { name: "foo", age: 3 };
  t.is(getAge(p), 3);
  delete p.age;
  t.is(getAge(p), "-");

  const factorial = match(1, 1).match(int, n => n * factorial(n - 1));

  t.is(factorial(3), 6);

  const EmptyArray = typeby(arr => Array.isArray(arr) && arr.length === 0);

  const tail = match(EmptyArray, [])
    .match(Array, arr => arr.slice(1))
    .otherwise([]);
  t.is(tail([1, 2])[0], 2);
  t.is(tail(0).length, 0);
});

test("Sanitise objects via records", t => {
  const Address = record({
    city: string,
    street: string,
    house: int,
    zip: optional(string)
  });
  const User = record({
    username: string,
    address: Address
  });
  const user = {
    username: "foo",
    password: "bar",
    address: {
      city: "x",
      street: "y",
      house: 4,
      foox: 3
    }
  };
  t.deepEqual(User.sanitise(user), {
    username: "foo",
    address: {
      city: "x",
      street: "y",
      house: 4
    }
  });
  user.username = 4;
  t.is(User.sanitise(user), null);
});

test("Reflect entire schema", t => {
  const User = record({
    username: string,
    address: {
      city: string,
      street: string,
      house: int,
      zip: optional(union(string, int))
    },
    comments: [
      {
        content: string
      }
    ]
  });
  t.is(
    isinstance(
      {
        username: "foo",
        address: {
          city: "x",
          street: "y",
          house: 4
        },
        comments: [{ content: "foo" }]
      },
      User
    ),
    true
  );
  t.is(
    isinstance(
      {
        username: "foo",
        address: {
          city: "x",
          street: "y",
          house: 4
        },
        comments: [{ contents: "foo" }]
      },
      User
    ),
    false
  );
  try {
    record({
      foo: [int, string]
    });
    t.fail();
  } catch (e) {
    //pass
  }
  t.is(
    isinstance(
      {
        values: [1, "2"]
      },
      record({
        values: []
      })
    ),
    true
  );
});

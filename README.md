# xype
Runtime JS type checking and matching

`xype` uses the new `Symbol.hasInstance` to create a robust solution for type-based code,
in the land of JavaScript.

## Install
`npm install --save xype`

## Usage
### Basic type-checking

```js
import { isinstance, premitives } from 'xype';
/*
premitives = { number(1, 2.3, NaN, ...), string('hello'), bool(true, false), nil(null, undefined) }
isinstance = basically, instanceof as a function
*/

isinstance(3, premitives.number) // true
```

### Optional
`xype` introduces a new `optional<T>` type, which functions much like haskell's `Maybe<T>`.

```js
import { isinstance, premitives, optional } from 'xype';
const maybeNumber = optional(premitives.number);
isinstance(3, maybeNumber) // true
isinstance(null, maybeNumber) // true
isinstance('3', maybeNumber) // false
```

### Records
```js
import { isinstance, premitives, optional, record } from 'xype';
const Person = record({
    name: premitives.string,
    age: optional(premitives.number),
});

// Records can be extended infinitely
const AgelessPerson = Person.extended({ age: premitives.nil });
const p = { name: 'Foo' };
isinstance(p, Person); // true
isinstance(p, AgelessPerson); // true
p.age = 4;
isinstance(p, Person); // true
isinstance(p, AgelessPerson); // false
delete p.name
isinstance(p, Person); // false
isinstance(p, AgelessPerson); // false
```

### Creating new types
```js
import { isinstance, typeby } from 'xype';
const EmptyArray = typeby(instance => Array.isArray(instance) && instance.length === 0);

isinstance([], EmptyArray) // true
isinstance([1], EmptyArray) // false
```

## Matching
`xype` exposes a relatively powerful matching function, aimimng to emulate haskell's pattern-matching capabilities.

The `match` function recieves an array of *matchers*. A *matcher* is either a non-array (which is always matched and is returned), or an array of the form: `[type, predicate, mapper]`. If the array consists of only 2 elements, the 2nd is considered the mapper, not the predicate. This function returns a function, which accepts a single parameter and returns the result of running it through the matchers.
Otherwise, see examples below:

```js
import { isinstance, premitives, optional, record, match } from 'xype';
const Person = record({
    name: premitives.string,
    age: optional(premitives.number),
});
const AgelessPerson = Person.extended({ age: premitives.nil });

const isEven = match([
    [premitives.number, x => x % 2, false], // If you're a number, and x % 2 results in non-zero, return false
    [premitives.number, true], // otherwise, if you're a number, return true
    false // return false, otherwise
]);
t.is(isEven(1), false);
t.is(isEven(2), true);
t.is(isEven('2'), false);

const getAge = match([
    [AgelessPerson, '-'], // If you're an AgelessPerson, return '-'
    [Person, ({ age }) => age], // If you're a Person, return age property
    // otherwise, return undefined
]);

const p = { name: 'foo', age: 3 };
t.is(getAge(p), 3);
delete p.age;
t.is(getAge(p), '-');

const factorial = match([
    [1, 1], // if n is 1, return 1
    [premitives.number, n => n * factorial(n - 1)] // if n is a number, map it through the mapper function
]);

t.is(factorial(3), 6);

const tail = match([
    [Array, arr => arr.length, arr => arr.slice(1)], // if arr is a non-empty array, return slice from 2nd elemenet
    [[]] // otherwise, return empty array
]);
t.is(tail([1, 2])[0], 2);
t.is(tail(0).length, 0);
```
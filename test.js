import test from 'ava';
import { optional, match, record, isinstance, premitives } from '.';

const Person = record({
    name: premitives.string,
    age: optional(premitives.number),
});

const AgelessPerson = Person.extended({ age: premitives.nil });

test('Premitives', t => {
    t.is(isinstance(1, premitives.number), true);
    t.is(isinstance('1', premitives.number), false);
    t.is(isinstance('foo', premitives.string), true);
    t.is(isinstance(true, premitives.string), false);
    t.is(isinstance(true, premitives.bool), true);
    t.is(isinstance(false, premitives.bool), true);
    t.is(isinstance('', premitives.bool), false);
    t.is(isinstance(null, premitives.nil), true);
    t.is(isinstance(undefined, premitives.nil), true);
    t.is(isinstance(false, premitives.nil), false);
});

test('Optional', t => {
    const maybeNum = optional(premitives.number);
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
});

test('Match', t => {
    const isEven = val => match(val, [
        [premitives.number, x => x % 2, false],
        [premitives.number, true],
        false
    ]);
    t.is(isEven(1), false);
    t.is(isEven(2), true);
    t.is(isEven('2'), false);

    const getAge = p => match(p, [
        [AgelessPerson, '-'],
        [Person, ({ age }) => age],
    ]);

    const p = { name: 'foo', age: 3 };
    t.is(getAge(p), 3);
    delete p.age;
    t.is(getAge(p), '-');

    const factorial = n => match(n, [
        [1, n],
        [premitives.number, n => n * factorial(n - 1)]
    ]);

    t.is(factorial(3), 6);

    const tail = arr => match(arr, [
        [Array, arr => arr.length, arr => arr.slice(1)],
        [[]]
    ]);
    t.is(tail([1, 2])[0], 2);
    t.is(tail(0).length, 0);
});
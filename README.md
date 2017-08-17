![logo](docs/images/logo.jpg)

> A Modeling abstraction for your Firebase Apps

## Overview

This library wraps the [`abstracted-admin`](https://www.abstracted-admin.com/) npm module to provide another layer of functionality targeting building "models" within your Firebase backend. As a simple example you can define a model as: 

```ts
import Model, { Relationship, RelationshipPolicy } from 'firemodel';

export interface IPerson {
  name: string;
  age: number;
  father: Relationship<T>('belongsTo', RelationshipPolicy.keys);
  mother: Relationship<T>('belongsTo', RelationshipPolicy.lazy);
  children: Relationship<T>('hasMany', RelationshipPolicy.inline);
}

export default class Person extends Model<IPerson> {
  constructor() {
    this.prefix = '/auth';
    this.mockSchema: MockGenerator = (h) => () => ({
      name: h.faker.name.firstName(),
      age: h.faker.number({min: 1, max: 100})
    });
  }
}
```

and then you can use it in many ways such as:

```ts
import DB from 'abstracted-admin';
import Person from './person';
const db = new DB();
const person = new Person(db);

// Streaming Events
person.listenToRecord(key: string);           // "value" event listener on individual record
person.listenToChildren('added', 'removed');  // 1:M child event listeners
person.listenToFirst(10, 'added', 'removed'); // 1:M child event listeners with query attached

// one time, async retrievals 
const joe = await person.getOnce(key: string);
const people = await person.getOnce();

// generate mocks
const people = person.generate(10);
const people = person.generate(10, { age: 15 });

// get relationship
const bobby = await person.getOnce(key: string);
const children = bobby.children();   // sync return of records if "inline"
const children = bobby.children();   // sync return of keys if "keys"
const children = await bobby.children();   // async return of records if "lazy"
```

## Installation

```sh
npm install firemodel
```

## Documentation

Documentation can be found at: [http://www.firemodel.info](http://www.firemodel.info)

## License

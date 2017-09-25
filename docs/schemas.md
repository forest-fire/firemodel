# Schemas {#schemas}

## Overview
Schemas are used to define our data structures/types. That is their sole purpose and therefore they have no understanding of the underlying database storage (aka, Firebase) nor do they know about the local state management techniques (aka, redux, ember-data, mobx, etc.). 

For compile-time, creating a schema would be a bit redundant because in fact Typescript's promise as a "_super-set of Javascript_" **is** a type system that in essence is the function of our "schema". The problem is that at run-time, the definitions we've put in place are lost and we're back to dealing with "anything goes" data structures. Now sure, we could implement some sort of run-time definition in addition to our Typescript definitions but in an attempt keep things DRY we will employ two experimental features of JS/TS:

- [`Decorators`](https://github.com/tc39/proposal-decorators)
    Decorators in JS/TS are represented by the '@' symbol followed by a function. These functions can be applied to properties and classes. As hopefully you'll agree, they provide very rich meta-programming capabilities in a succinct and elegant fashion. For those of you coming from other languages, you may very well be familiar with the concept and so this will be pretty straight forward.
    
    Decorators are currently at stage 2 in the TC39 proposal workflow but they are already being used in GlimmerJS, VueJS, and Angular so it seem very likely they will make it through the process.
- [`Reflection`](http://www.ecma-international.org/ecma-262/6.0/#sec-reflection)
    Reflection is a "partner in crime" to Decorators and allows us to capture the Typescript typing information for later use at run-time. This is great as it allows us to use the highly expressive Typescript semantics and have that information available to us at compile and run time.

    Reflection is less far along than Decorators in terms of proposal stage but it is already supported in many browsers ([caniuse](http://kangax.github.io/compat-table/es6/#test-Reflect)) and there are polyfills that make this a safe choice to use now. 

### Configuration

In order to use these features in Typescript you will need to change two variables in the `tsconfig.json` file:

```ts
{
  "compilerOptions": {
    // ...
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Getting Started

Now that we understand the basic aim of **Schemas** let's get more hands on. Here's a simple example of what we might find as a Schema definition:

```ts
import { fk, BaseSchema, schema, property, belongsTo, hasMany } from 'firemodel';
import { Company } from './company';

const ageFn = (person: Person) => {
  return moment().diff(moment(person.birthday), 'years');
}

@schema({ dbPrefix: '/authenticated' })
export class Person extends BaseSchema {
  @property public name: string;
  @property public birthday: number;
  @belongsTo<Company>() employer: fk;
  @belongsTo<Person>('inline') father: fk;
  @belongsTo<Person>('raw') mother: fk;
  @hasMany<Person>('lazy') siblings: fk[];

  @computed('age', ageFn) public age: number
}
```

In the above example we see examples of all three of the key structural properties of a schema:

1. Properties
2. Relationships
    a. belongsTo (aka, [0/1]:1)
    b. hasMany (aka, 1:M)
3. Computed Properties

In the coming sections we'll cover each of these but before we do let's quickly touch on the subclass **BaseSchema** that all schema's are expected to inherit from.



### `BaseSchema` Definition

All schema's should derive off of the "BaseSchema" class which provides the following properties to all schemas:

  - `id` - a string property to point to the specific "key" in the database; often this will be a Firebase pushkey but it can be any string based key
      > note: all firebase paths are strings so we aren't in any way limiting ourselves by imposing the "string" type
  - `lastUpdated` - a date representing the last change to a given record
  - `createdDate` - a date representing when a given record was first created

In addition to these properties, the BaseSchema also adds a `META` property to the class which is where all meta-information added with the `schema` decorator will be stored.
## Properties {#properties}

A property doesn't need a lot of clarification ... it is just a defined part of the data structure -- which unlike a _relationship_ -- is encapsulated wholely inline to the schema.

The simplist example would be something like:

```ts
@schema()
export class Person extends BaseSchema {
  @property public name: string;
}
```

With this definition at compile-time Typescript will ensure that each **Person** schema will have a string-based name associated with it. If we would like to have access to this type information at run-time we would use the reflection API like this:

```ts
const person = new Person();
const type = Reflect.getMetadata('name', person).type; // String
```

### Contraints (and other meta data)

In many cases, this simple example is enough to model your schema fully but sometimes it would be nice to decorate it more fully with meta-data. Let's say in this example we want to provide an `age` property but we'd like to contrain it only being a positive integer value. This can be achieved like so:

```ts
@schema()
export class Person extends BaseSchema {
  @property @positive @integer public age: number;
}
```

In this example we've used constraints that are very common and as a result we've provided you with a "shorthand" syntax for this meta-data. The shorthand operators include:

- min(#)
- max(#)
- integer
- float
- positive
- negative

But if there's ever a need to add additional meta-information you can use whatever you like with the `contraint(prop, val)` decorator. For instance, using just this operator, here is the same definition as above:

```ts
@schema()
export class Person extends BaseSchema {
  @property @contraint('min', 0) @contraint('isInteger', true) public age: number;
}
```

## Relationships {#relationships}


## Computed Properties {#computed}


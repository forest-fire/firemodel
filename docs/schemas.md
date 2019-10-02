# Schemas {#schemas}

## Overview
Schemas are used to define our data structures/types. That is their sole purpose and therefore they have no understanding of the underlying database storage (aka, Firebase) nor do they know about the local state management techniques (aka, redux, ember-data, mobx, etc.). 

For compile-time, creating a schema would be a bit redundant because in fact TypeScript's promise as a "_super-set of Javascript_" **is** a type system that in essence is the function of our "schema". The problem is that at run-time, the definitions we've put in place are lost and we're back to dealing with "anything goes" data structures. Now sure, we could implement some sort of run-time definition in addition to our TypeScript definitions but in an attempt keep things DRY we will employ two experimental features of JS/TS:

- [`Decorators`](https://github.com/tc39/proposal-decorators)
    Decorators in JS/TS are represented by the '@' symbol followed by a function. These functions can be applied to properties and classes. As hopefully you'll agree, they provide very rich meta-programming capabilities in a succinct and elegant fashion. For those of you coming from other languages, you may very well be familiar with the concept and so this will be pretty straight forward.
    
    Decorators are currently at stage 2 in the TC39 proposal workflow but they are already being used in GlimmerJS, VueJS, and Angular so it seem very likely they will make it through the process.
- [`Reflection`](http://www.ecma-international.org/ecma-262/6.0/#sec-reflection)
    Reflection is a "partner in crime" to Decorators and allows us to capture the TypeScript typing information for later use at run-time. This is great as it allows us to use the highly expressive TypeScript semantics and have that information available to us at compile and run time.

    Reflection is less far along than Decorators in terms of proposal stage but it is already supported in many browsers ([caniuse](http://kangax.github.io/compat-table/es6/#test-Reflect)) and there are polyfills that make this a safe choice to use now. 

### Configuration

In order to use these features in TypeScript you will need to change two variables in the `tsconfig.json` file:

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
import { fk, Model, schema, property, belongsTo, hasMany } from 'firemodel';
import { Company } from './company';

const ageFn = (person: Person) => {
  return moment().diff(moment(person.birthday), 'years');
}

@model({ dbPrefix: '/authenticated' })
export class Person extends Model {
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

In the coming sections we'll cover each of these but before we do let's quickly touch on the subclass **Model** that all schema's are expected to inherit from.



### `Model` Definition

All schema's should derive off of the "Model" class which provides the following properties to all schemas:

  - `id` - a string property to point to the specific "key" in the database; often this will be a Firebase pushkey but it can be any string based key
      > note: all firebase paths are strings so we aren't in any way limiting ourselves by imposing the "string" type
  - `lastUpdated` - a date representing the last change to a given record
  - `createdDate` - a date representing when a given record was first created

In addition to these properties, the Model also adds a `META` property to the class which is where all meta-information added with the `schema` decorator will be stored.
## Properties {#properties}

A property doesn't need a lot of clarification ... it is just a defined part of the data structure -- which unlike a _relationship_ -- is encapsulated wholely inline to the schema.

The simplist example would be something like:

```ts
@model()
export class Person extends Model {
  @property public name: string;
}
```

With this definition at compile-time TypeScript will ensure that each **Person** schema will have a string-based name associated with it. If we would like to have access to this type information at run-time we would use the reflection API like this:

```ts
const person = new Person();
const type = Reflect.getMetadata('name', person).type; // String
```

### Contraints (and other meta data)

In many cases, this simple example is enough to model your schema fully but sometimes it would be nice to decorate it more fully with meta-data. Let's say in this example we want to provide an `age` property but we'd like to contrain it only being a positive integer value. This can be achieved like so:

```ts
@model()
export class Person extends Model {
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
@model()
export class Person extends Model {
  @property @contraint('min', 0) @contraint('isInteger', true) public age: number;
}
```

## Relationships {#relationships}
There are three characteristics we'll need to understand when defining a relationship:

1. Cardinality - aka, 0:1, 1:1, 0:M, 1:M, M:M
2. Mirrored - in non-relational modelling like Firebase it is very common to have some denormalization; one area where we see this is both models engaged in the relationship having foreign keys pointing at the other.
3. Meta/Contraints


## Computed Properties {#computed}

Not implemented or documented yet

## Mocking

Because a schema's information is typed we can approximate reasonable mocking information without any additional code. So as a default, nothing is required. However, it often pays to be a little more explicit about the MockGenerator function and you can enhance the auto-generated rules. If our Person schema is defined as:

```ts
@model()
export class Person extends Model {
  @property name: string;
  @property @positive @integer @max(100) age: number;
  @property isMale: boolean;
  @property skills: Skillsets[];
}
```

and we simply leave mock generation to auto-sense appropriate values:

```ts
const PersonModel = new Model<Person>();
PersonModel.generate(3);
console.log(PersonModel.getList());
```

Our output would look something like:
```ts
[
  {id: 'fasfs324234', name: 'run aptly', age: 55, isMale: true},
  {id: 'fasfs324245', name: 'stinky cheese', age: 23, isMale: false},
  {id: 'fasfs324680', name: 'watermellon canyon', age: 11, isMale: true},
]
```

From this we might conclude that `age` and `isMale` is just fine but `name` is not ideal (we just have a "string" where what we want is a human person's name). To fix this we just add the `@mock` docorator to the schema definition:

```ts
@property @mock('faker.name.first') name: string;
```

In the above example the `@mock` decorator receives a string instruction which is uses to lookup via dotted notation from either the **Faker** or **ChoiceJS** mock generator utilities. This provides a nice shorthand but sometimes isn't flexible enough so we can also pass in a `PropertyCallback` which is similar to **firemock's** `SchemaCallback` type. 

```ts
@mock((h) => {
  return h.faker.name.first + ' ' + h.faker.name.last;
}) 
@property name: string;
```
1

# Overview

## Prerequisites

### Typescript

This package _assumes_ you're using Typescript transpiled to JS rather than just straight-up Javascript. With later versions of Typescript you may actually be able to get away with using plain Javascript because via JSDocs you can specify more typing but this hasn't been tested so for your sake and mine, just use Typescript. :) 

### Decorators and Reflection

**firemodel** uses both _decorators_ and _reflection_ to allow for a simple syntax which provides both **static** as well as **run-time** typing of your schemas (without the need to articulate it twice). Hopefully you like this convenience but in order to get it to work you must modify your `tsconfig.json` file with the following two parameters:

```ts
{
  "compilerOptions": {
    // ...
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  }
}
```

## Major Entities Overview
Firemodel has a few major entities that we must understand before we're to go any further:

- [`Schemas`](./schemas.md): 

  A schema is a typescript definition of a data structure for data "records" which conforms to this schema. It is meant to be very minimal and its only concern is defining the data structure. The data structure can be comprised of _properties_, _relationships_, and _computed properties_. A simple example might look like:

  ```ts
  @schema()
  export class Person extends BaseSchema {
    @property public name: string;
    @property public age: number;
  }
  ```

- `Models`: 

  Models provide a useful API surface for working with a given schema and while the class definition of Model is generic, instantiating it requires the passing in of the specific schema so that it's API will address the specifics of a given schema. Instantiation will look something like:

  ```ts
  const person = new Model<Person>(db);
  ```

  Where the `db` reference provides the model access to a standard API to work with the firebase API (or mocking library).

- `Records`:

  Is a single record which is typed against the schema and provides a simple write API to update/delete.

  ```ts
  const tommy: Record<Person> = person.get('1234');
  ```

- `Lists`: 

  Is a set of records of a given schema type. For instance using the _people_ model from above:

  ```ts
  const people: List<Person> = person.getAll();
  ```

- `Listeners`:

  Considering Firebase is a _real time_ database, the most typical manner of interacting to database reads is rather than polling simply expressing paths in the database you'd like to be 




# Getting Started

## Overview
Firemodel has a few major entities that we must understand before we're to go any further:

- `Schemas`: 

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



## Schemas {#schemas}

### BaseSchema Definition

All schema's should derive off of the "BaseSchema" class which provides the following properties to all schemas:

  - `lastUpdated` - a date representing the last change to a given record
  - `createdDate` - a date representing when a given record was first created

### Properties {#properties}

```ts
export interface IName {
  first: string;
  last: string;
}

@meta({ dbPrefix: '/auth', offline: true, plural: 'people' })
export class Person extends BaseSchema {
  @property public name: IName;
  @property @min(0) @max(150) public age: number;
  @belongsTo('Person') public father: fk;
  @belongsTo('Person', RelationshipPolicy.inline) public mother: fk;
  @hasMany('Person', RelationshipPolicy.raw) public siblings: fk[];
}
```

### Relationships {#relationships}


### Computed Properties {#computed}

### Meta Characteristics


## Mocking {#mocking}



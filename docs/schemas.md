# Schemas {#schemas}

Schemas are what we use to define our data structures. That is their sole purpose. They have no understanding of the database storage nor do they know about the local state management techniques. 

Because we're using Typescript we will use Typescript nominclature to describe our schemas. We can use any typing we feel best describes our data structure. In defining 

## BaseSchema Definition

All schema's should derive off of the "BaseSchema" class which provides the following properties to all schemas:

  - `lastUpdated` - a date representing the last change to a given record
  - `createdDate` - a date representing when a given record was first created

## Properties {#properties}

```ts
@schema({ dbPrefix: '/auth', offline: true, plural: 'people' })
export class Person extends BaseSchema {
  @property public name: string;
  @property @min(0) @max(150) public age: number;
  @belongsTo<Person> public father: fk;
  @belongsTo<Person> @policy('inline') public mother: fk;
  @hasMany<Person> @policy('lazy') public siblings: fk[];
}
```

## Relationships {#relationships}


## Computed Properties {#computed}

## Meta Characteristics


## Mocking {#mocking}



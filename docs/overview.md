# Overview

Firemodel provides a set of typed classes which will allow you to quickly and easily structure your data, interact with a Firebase database, and play nicely with modern state management frameworks like redux, mobx, etc. 

## Key Entities / Classes
Let's review the primary classes which Firemodel provides as this represents the distinct set of API's which you will use to:

1. Define your Model/Entity data structures (_schemas_)
2. Interact with the Database on behalf of a particular data type (_models_)
3. Interact with the data itself (_record_ and _list_)

 a number of classes which represent the major functional entities and before going any further it's worth getting an overview of these as it will provide a good set of nomenclature/terminology used in this package:

### [`Schemas`](./schemas.md)

  A schema is a class which defines a data structure. This structure will be assigned to "data records" which conform to this schematic type. It is meant to be very minimal and its only concern is defining the data structure. The data structure can be comprised of _properties_, _relationships_, and _computed properties_. A simple example might look like: 

  ```ts
  @schema()
  export class Person extends BaseSchema {
    @property public name: string;
    @property public age: number;
    @belongsTo<Person> public father: fk;
  }
  ```

  [→ More on Schemas](./schemas.md)

### [`Models`](./models.md)

  Models provide a useful API surface for working with a given schema. While the class definition of Model is generic, instantiating it requires the passing in of the specific schema so that it's API will address the specifics of a given schema. Instantiation will look something like:

  ```ts
  const person = new Model<Person>(db);
  ```

  Where the `db` reference provides the model the API to work with the firebase database and by _typing_ the model we can ensure that all the meta-characteristics of the **Person** schema are maintained.

  The API surface for the `Model` class will be gone into far greater detail later on but could include operations such as:

  ```ts
  // One-time read of a Record
  const joe: Record<Person> = await person.getOnce('1234'); 
  // One-time read of a List of Records
  const latestUpdated: List<Person> = await person.orderByChild('lastUpdated').limitToFirst(10).getOnce();
  // Subscribe to real-time updates
  person.listenTo(callback); // hybrid VALUE => Child listener
  person.listenToChildren(callback, 'added', 'removed');
  person.listenToRecord(id); // listen to particular child
  ```

  [→ More on Models](./models.md)

- `Records`

  Is a single record which is typed against the schema and provides a simple write API to update/delete.

  ```ts
  const tommy: Record<Person> = person.get('1234');


  // One-time add / push
  const added = await person.push({ ... });
  // One-time updates
  const response = await person.update('1234', { age: 45 });
  ```

- `Lists`: 

  Is a set of records of a given schema type. For instance using the _people_ model from above:

  ```ts
  const people: List<Person> = person.getAll();
  ```

- `Listeners`:

  Considering Firebase is a _real time_ database, the most typical manner of interacting to database reads is rather than polling simply expressing paths in the database you'd like to be 




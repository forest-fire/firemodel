# Dexie Integration

[Dexie](http://dexie.org/) is a great little API for working with a browser's IndexedDB and now that service workers have gained large scale adoption it's more and more likely you'll want to look into modern client storage/caching. **Firemodel** exposes a simple API to allow using your Firemodel models in Dexie/IndexedDB:

## The `DexieDb` Class

The entry point for using your **Firemodel** `Model`'s with **Dexie** is the `DexieDb` class. It provides a simple way to:

- setup the right indexing configuration for Dexie,
- add in prior _versions_ (and upgrade functions where needed),
- and connect to the IndexedDB via Dexie

A simple example would look like this:

```typescript
import { DexieDb } from "firemodel";
import { Person, Car, Todo } from './models';
const db = new DexieDb('test-database', Person, Car, Todo);
// add a prior version, no upgrade needed
db.addPriorVersion( { models: { cars: '&id' } } );
// add a prior version, including an upgrade function
db.addPriorVersion( {
  models: { cars: '[make+model], people: '&id'},
  upgrade: (tx) => {...} }
);
```

> **Note:** if no prior versions are needed, no configuration is needed as the model definitions provide `@index`, and `@uniqueIndex` decorators and so long as they are used appropriately this will automatically translate into the right Dexie index specification.

At this point you've configured but not connected to the **IndexedDB**. To connect you could call `await db.open()` but this is unnecessary as any CRUD operation with the database will immediately ensure that the database is connected before executing the operation. 

The CRUD interactions will be done through four API's -- Record, List, Table, and Transaction -- the first two are meant to resemble the `Record` and `List` interaction style. They aren't identical but they're similar. The latter two are just providing access directly back to **Dexie** API's. Let's explore each:

## The Record API

You gain access to the Record API off of the `DexieDb.record` function; it would be accessed like so:

```typescript
import { Person, Car, Todo } from './models';
const db = new DexieDb('test-database', Person, Car, Todo);
const recordApi = db.record(Car)
```

Although an implementation detail, it may be useful to know that this API is implemented with the `DexieRecord` class. This class provides basic record-level crud operations:

```typescript
{
  get(pk: IPrimaryKey<T>) {...}
  add(record: Partial<T>) {...}
  update(pk: IPrimaryKey<T>, record: Partial<T>) {...}
  remove(pk: IPrimaryKey<T>) {...}
}
```

> Note: this is psuedo-code intended as only a reference to the scope of this class; this class -- like all **Firemodel** classes -- is fully typed with fairly robust documentation built into the typing.

To give a representative example of how you might use the API, let's add a new Car to the database:

```typescript
import { Person, Car, Todo } from './models';
const db = new DexieDb('test-database', Person, Car, Todo);
const car = db.record(Car);
await car.add({ id: '1234', make: 'Ford', model: 'Fiesta', modelYear: 1999 })
const gotIt = await car.get('1234');
```

This example is pretty straight forward but it's probably worth pointing out two things which are under the hood:

- The `gotIt` variable will be a correctly typed `Car` object
- While we're not yet taking advantage of indexes, the fact that the car's model specified the `modelYear` as an `@index` means that we use Dexie API's on that property

## The List API

The List API -- implemented in the `DexieList` class -- is meant to resemble the API used off of the `List` class and provides a set of handy queries for _lists_ of a given `Model`. The API looks like this:

```typescript
{
  /** all records of the given model */
  all() {...}
  /** return results where an indexed property meets a simple comparison logic test */
  where(prop: keyof T, value: any | [ ComparisonOperation, any ]) {...}
  /** all records of given model that were updated since a particular datetime */
  since(datetime: epoch) {...}

  // ...
}
```

> **Note:** use the _typing_ and source for the latest API nuance; above is representative

This set of endpoints should be quite familiar and provides a decent set of querying capabilities but if you want to go further you should consider digging into the more capable Table API.

> **Note:** the Table API (provided by Dexie) takes advantage of **IndexedDB**'s more complete indexing strategies whereas Firemodel is limited to the **Firebase** API's limited querying capability.

## The Table API

The Table API is a very nice SQL-like API that **Dexie** exposes. For more on this API you should refer to the Dexie site:

- [Dexie Table API](https://dexie.org/docs/Table/Table)

An example of how you might use it though could like this:

```typescript
import { Person, Car, Todo } from './models';
const db = new DexieDb('test-database', Person, Car, Todo);
const cars = db.table(Car);
const olderCars = await cars.where('modelYear').below(2000).toArray();
```

In this example, the property `olderCars` ends up being an array of `Car` objects. Fully typed and ready for your driving pleasure.

## The Transaction API

Transactional support is a powerful feature that ensures that there is [atomicity](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) in writes to the database that need to ensure that the _set_ of transactions either ALL succeed or ALL fail. IndexDB provides this underlying feature but the API is awkward but fortunately Dexie makes this much, much easier to navigate. Please point your browser to their documentation for more details:

- [Dexie Transaction API](https://dexie.org/docs/Transaction/Transaction)

Gaining access to this API is just a matter of referencing the `transaction` property of `DexieDb`:

```typescript
import { Person, Car, Todo } from './models';
const db = new DexieDb('test-database', Person, Car, Todo);
const transactionApi = db.transaction;
```


# Dexie Integration

[Dexie](http://dexie.org/) is a great little API for working with IndexDB and now that service workers have gained large scale adoption it's more and more likely you'll want to look into modern client storage/caching. **Firemodel** exposes a simple API to allow using your Firemodel models in Dexie/IndexDB:

## Model Definitions

```typescript
import { DexieModel } from "firemodel";
const models = DexieModel.models(Person, Car, Todo)
```

This will create a simple text definition for a given set of **Firemodel** `Model`'s. Using the `@index` property decorator will ensure that the properties you want as indexes in Dexie are appropriately configured. To illustrate this in code, here's a typical way to initialize a IndexDB with Dexie which leverages the capabilities provided by `DexieModel`:

```typescript
import Dexie from 'dexie';
import { DexieModel } from "firemodel";

const db = new Dexie('myDb');
db.version(1).stores(DexieModel.models(Person, Car, Todo));

export default db;
```

## Basic CRUD

In an attempt to keep the learning curve as low as possible for Dexie, a simple API surface that resembles **Firemodel**'s is provided to work with Dexie. For instance to get a record you might do the following:

```typescript
import { DexieRecord } from 'firemodel';
const record = await DexieRecord.get(Person, '1234');
```

Similarly if you wanted to _update_ a record you would do the following:

```typescript
import { DexieRecord } from 'firemodel';
const record = await DexieRecord.update(Person, '1234', { age: 24 })
```

Off of `DexieRecord` you'll find `get`, `add`, `update`, and `remove` methods which are largely a mirror of what you'd find in the `Record` API. It opens up all basic CRUD operations without really any need to know Dexie. For more advanced work with Dexie, however, it will be worth becoming familiar with it's direct API.

## Lists and Queries

Similar to the approach taken with `DexieRecord`, the `DexieList` class provides you a basic set of tools to query the local IndexDB using Dexie but while largely using a familiar and consistent API to what is available off of the `List` class.

As an example, if you wanted to get a list of _all_ the people in IndexDb this could be achieved with:

```typscript
import { DexieList } from 'firemodel';
const people = await DexieList.all(Person)
```

Further if you wanted a list of all people above the age of 25 you would state:

```typescript
import { DexieList } from 'firemodel';
const people = await DexieList.where(Person, 'age', ['>', 25])
```

As you become familiar with Dexie, however, you may find that you prefer Dexie's query syntax (especially if you have a SQL query background) and because IndexDB is more capable in the query department than Firebase there are things you can do with the Dexie syntax that just wouldn't be possible with Firebase (and consequently the Firemodel API).
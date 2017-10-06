# Models

## Introduction

A model is functionally the happy marriage between a defined `Schema` class and _database access_. Within this "marriage" you get a straightforward API surface for 

> Note: database access is provided by either:

>  - **abstracted-admin** - for nodejs projects which are allowed admin priv.
>  - **abstracted-client** - for frontend JS projects

> Both of these projects fulfill the `IAbstractedFirebase` interface which the firemodel will use as the supported contract for database access.

### Example Instantiation

Based on _what_ a Model class represents you may find the instantiation of a Model class rather anticlimatic:

```ts
import { DB } from 'abstracted-admin';
import { Person } from './schemas/person';
const db = new DB();
const PersonModel = new Model<Person>(Person, db);
```

## API Surface

Now that we have instantiated a schema-specific Model class, let's explore how we might use the provided API surface. We'll look at this in functional subsections starting with one-time reads.

### One-time Reads
One time reads may not be the _sexiest_ thing you can do with a real-time database but they are important; especially in the NodeJS micro-services which may just wake up to check one thing on the database.

With reads you'll primarily be getting a single record from a model or a list of records. These two goals are expressed in the API as:

```ts
const freddy: Record<Person> = await PersonModel.getRecord('1234');
const people: List<Person> = await PersonModel.getAll();
const people: List<Person> = await PersonModel.getSome().limitToFirst(5).execute();
```

> note: the `getSome()` variant allows you to use any Firebase filter criteria to reduce the number of records you get back

In addition you can use "find" based derivatives if you want a simple search/filter:

```ts
const freddy: Record<Person> = await PersonModel.findRecord('name','Freddy');
const children: List<Person> = await PersonModel.findAll('age', ['<=', 18]);
```

The API design intentionally limits the query parameters to a single property; this is done to mimic the constraint that the Firebase query engine imposes. If you need to filter on multiple properties then use the `findAll` API to reduce to the smallest resultset you can with a single parameter and perform any secondary filtering client side.

Both `findRecord` and `findAll` assume an equality operator for comparison sake by default but you can optionally include an explicit operator (valid are: "=", ">=", "<=") by passing in the tuple to the VALUE (as seen above).

> **In Depth:**
    Both of the _findXXX_ endpoints will leverage server querying (versus client side) to increase performance (reduced network utilisation and client parsing). So, for example, `PersonModel.findRecord('name','Freddy')` will be translated into the following Firebase query:

  ```ts
  ref.orderByChild('name').equalTo('Freddy').limitToFirst(1);
  ```
  
> Also be aware that, if you are using FIND api endpoints you should add an index to the database to ensure this remains performant as record size increases.

### One-time Writes

Although you may choose to do some of the write operations off the `Record` API directly you can do them here too, starting with the basic endpoints:

```ts
const result = await PersonModel.push( newPerson );
const result = await PersonModel.update('1234', { age: 45 } );
const result = await PersonModel.remove('1234');
```

The Model also provides a relatively efficient bulk update:

```ts
const result = await PersonModel.updateWhere('age', ['>=', 80], { elderly: true });
const result = await PersonModel.updateWhere('age', ['>=', 80], (r: Record) => {
  //...
});
```

> **In Depth:**
    In the above example this will first query using the comparative filter to get the id's that remain, then do a "multi-path update" to the database. The multi-path update ensures that all updates are done with a single call to the DB and are treated as a transaction.

## Real-time Event Streams {#events}

### How to listen for Events 
Firebase is a "real-time" database and so therefore one of the best ways of interacting with it is simply tell the database what "paths" you care about and then let it inform you of changes at these paths through events. This model of "reading" may take a little getting used to if you're used to standard request/reply DB interaction but for long-living applications this is definitely the way to manage state synchronization between the database and the app.

So let's quickly review the types of events that Firebase provides:

  1. **Value Events** - a _value_ event gives you back the entire tree of data at the given path everytime a change takes place. The path you listen to on a value event can be a single value, a Record, or a list of Record but typically its best to use value events for relatively "leaf nodes" which in the case of Firemodel would be a `Record` more than a `List`.
  2. **Child Events** - _child_ events assume that the path being listened to is a `List` of records and then you can choose what things amoungst these children you care about:
    - **child_added** - fires initially for each record in the query resultset but from then on only fires when a new `Record` is added
    - **child_removed** - only fires when an existing `Record` is removed
    - **child_changed** - fires whenever a child `Record` is changed (anywhere in the graph below the Record)
    - **child_moved** - fires whenever a `Record` has changed in it's sort order

So as a basic principle, listening to an individual `Record` will typically done with a **Value** event. When listening to a `List` it will be some combination of child events. This sets up the first introduction to the API surface for event processing:

```ts
const listener = (event: any) => {
  // do something
}
const PersonModel = new Model<Person>(db);
PersonModel.listenTo(listener);
PersonModel.listenToRecord('1234', listener);
```

Further, the `listenTo` method can also be modified in scope with standard Firebase query operators:

```ts
PersonModel.orderByChild('lastUpdated').limitToLast(10).listen(listener);
```

> Query parameters for a single `Record` don't really make sense and are ignored when using the `listenToRecord()` method 

Also, its important to note that a call to `listenTo()` will add the "_default_ child listeners". Which are those? Well we exclude `child_moved` and add the remaining as the default. Why? Well _child_moved_ provides information about sorting which only applies if you client app uses the server returned sorting and many cases sorting is best left to the client app. If you want to explicitly set this you can:

```ts
PersonModel.listen(listener, 'child_added', 'child_moved', ...);
```

### The Listener and the Event {#listeners}

Up to now we've been focused on setting up an event stream but let's now turn our attention to the **Listener** functionality and what an "event" actually looks like. 

A _listener_ is really just a callback function which responds in a meaningful way to Firebase stream events. So in TypeScript grammer it would look like the example above but rather than being typed as "any" it instead is explicitly typed as a `FirebaseEvent`. FirebaseEvent is what is called a "[union type](https://www.typescriptlang.org/docs/handbook/advanced-types.html)" in Typescript. Which basically means that "it depends"; depends -- in this case -- on which event is being received. Fortunately each event has a property `kind` which defines which Firebase event triggered the callback and this allows all events to be strongly typed:

```ts
export type FirebaseEvent = IValueEvent | IChildAdded | IChildRemoved | IChildChanged | IChildMoved;
export interface IValueEvent<T> extends IFirebaseEvent<T> {
  kind: 'value';
}

export interface IMovedEvent<T> extends IFirebaseEvent<T> {
  kind: 'child_moved';
  prevChildKey: string;
}

// ... 

export interface IFirebaseEvent<T> {
  /** A unique string name which represents the event */
  type: string;
  /** The Firebase Event which triggered this event */
  kind: 'value' | 'child_added' | 'child_removed' | 'child_changed' | 'child_moved';
  /** The payload/value of the changed attribute */
  value: T;
  /** The calling context **/
  context?: IDictionary;
  /** The cancelation/error callback */
  cancelCallback?: (e: Error) => void;
}
```

In many cases you may find yourself writing your own Listener function, and this is entirely appropriate but if you are using **Redux** for state management then it is likely worth using the built in support to push these Firebase events into the Redux dispatcher to allow reducers to manage state locally:

```ts 
import { ReduxDispatcher } from 'firemodel';
const listener = ReduxDispatcher(redux.dispatch);
PersonModel.listen(listener);
CompanyModel.listen(listener);
```

Where `Firemodel.redux` is a higher order function which takes the dispatch function into scope on the first call and returns an normal event listener (in this example assigned to `listener`).

More details on this can be found at: [Other Concerns > Redux](./other.md#redux)

## Mocking


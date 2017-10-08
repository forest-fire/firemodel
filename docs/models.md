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

### One-time Writes {#writes}

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

So as a basic principle, listening to an individual `Record` will be done with a **Value** event, while listening to a `List` will be some combination of child events. This sets up the first introduction to the API surface for event processing:

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
PersonModel.orderByChild('lastUpdated').limitToLast(10).listenTo(listener);
```

Now imagine you started a listener like this:

```ts
const listener = (event) => {
  switch(event.type) {
    case '@firemodel/MODEL_START_LISTENING':
      console.log('MODEL LISTENING');
    case '@firemodel/MODEL_STATE_READY':
      console.log('READY');
    case '@firemodel/RECORD_ADDED': 
      console.log('MODEL ADDED');
    case '@firemodel/CHILD_REMOVED': 
      console.log('REMOVED');
    case '@firemodel/etc': 
      console.log('ETC');
  }
}

const PersonModel = new Model<Person>(Person, db);
PersonModel.listenTo(listener)
```

How might you expect your listener (and therefore your console output) to respond? Well imagining that the query returns a list of 5 people you'd get the following event stream:

```sh
MODEL LISTENING
ADDED
ADDED
ADDED
ADDED
ADDED
MODEL READY
```

At this point you'd know that all initial records needed to fulfill the query had been received from the Firebase backend. Going forward any of the relevant child listeners (added, removed, moved, changed) will fire if and when the data changes on the backend.

### Event Structure {#event-structure}

All events fired into listeners registered through the `listenTo` and `listenToRecord` methods have the following two properties:

- `type` - the event name that is firing
- `payload` - the primary state change that is being conveyed by this event

Beyond that each message will pass along other pieces of relevant context. For instance, each of the child listener events will pass along at least the following properties:

- `key` - the key which is being changed/added/removed/moved
- `path` - the database path leading directly to the key effected (includes the key as part of path)
- `model` - the schema/model which is triggering an event
- `query` - a serialized version of the query string used (blank if just a straight database path)

For more specifics refer to the type definitions which are found in [`/src/events.ts`]().

### Listeners and Local State {#listeners}
Up to now we've been focused on creating an event stream but let's now turn our attention to consuming it. Consumption of the event stream is the responsibility of the **Listener** where a listener conforms to the `FiremodelListener` type:

```ts
export FiremodelListener = (event: IFMEvent) => void;
```

The primary function of a listener is to take an incoming state change from the database and use that to modify the local, working copy of state. When you pass in your own listener you can go about this any way that suits your needs. In this day and age of SPA's though, there are a growing number of frameworks that help developers to manage that. 

#### Redux

Arguably the most popular of these local statement management frameworks is Redux. For those of you who know the framework you may have already realized that the `IFMEvent` events conform to the structure of a Redux "action." So if you wanted all state changes coming from the database to be put into your Redux flow you could create a handler that looks like so:

```ts
import { DB } from 'abstracted-admin';
import { Model } from 'firemodel';
import { Person } from './schemas/index';
import { dispatch } from 'redux';

const listener = (dispatch) => (event: IFMEvent) => {
  dispatch(event);
}

const person = new Model<Person>(Person, db);
person.listenTo(listener(dispatch));
```

Since this is a very common use-case, there's even a way to just define your listener once as a static property of the `Model` class and then all models can skip sending in a listener

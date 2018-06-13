## Introduction

A model is functionally the happy marriage between a defined `Schema` class and _database access_. Within this "marriage" you get a straightforward API surface for

> Note: database access is provided by either:

> - **abstracted-admin** - for nodejs projects which are allowed admin priv.
> - **abstracted-client** - for frontend JS projects

> Both of these projects fulfill the `IAbstractedFirebase` interface which the firemodel will use as the supported contract for database access.

### Example Instantiation

Based on _what_ a Model class represents you may find the instantiation of a Model class rather anticlimatic:

```ts
import { DB } from "abstracted-admin";
import { Person } from "./schemas/person";
const db = new DB();
const PersonModel = new Model<Person>(Person, db);
```

> note: the requirement for passing in the DB property is that it implement the [RealTimeDB interface](https://github.com/forest-fire/abstracted-firebase/blob/master/lib/index.d.ts#L1), the "abstracted-admin" does this for server based projects and the "abstracted-client" for when you're working in the browser.

## API Surface

Now that we have instantiated a schema-specific Model class, let's explore how we might use the provided API surface. We'll look at this in functional subsections starting with one-time reads.

### One-time Reads

One time reads may not be the _sexiest_ thing you can do with a real-time database but they are important; especially in the NodeJS micro-services which may just wake up to check one thing on the database.

With reads you'll primarily be getting a single record from a model or a list of records. These two goals are expressed in the API as:

```ts
const freddy: Record<Person> = await PersonModel.getRecord("1234");
const people: List<Person> = await PersonModel.getAll();
const people: List<Person> = await PersonModel.getSome()
  .limitToFirst(5)
  .execute();
```

> note: the `getSome()` variant allows you to use any Firebase filter criteria to reduce the number of records you get back

In addition you can use "find" based derivatives if you want a simple search/filter:

```ts
const freddy: Record<Person> = await PersonModel.findRecord("name", "Freddy");
const children: List<Person> = await PersonModel.findAll("age", ["<=", 18]);
```

The API design intentionally limits the query parameters to a single property; this is done to mimic the constraint that the Firebase query engine imposes. If you need to filter on multiple properties then use the `findAll` API to reduce to the smallest resultset you can with a single parameter and perform any secondary filtering client side.

Both `findRecord` and `findAll` assume an equality operator for comparison sake by default but you can optionally include an explicit operator (valid are: "=", ">=", "<=") by passing in the tuple to the VALUE (as seen above).

> **In Depth:**

    Both of the _findXXX_ endpoints will leverage server querying (versus client side) to increase performance (reduced network utilisation and client parsing). So, for example, `PersonModel.findRecord('name','Freddy')` will be translated into the following Firebase query:

```ts
ref
  .orderByChild("name")
  .equalTo("Freddy")
  .limitToFirst(1);
```

> Also be aware that, if you are using FIND api endpoints you should add an index to the database to ensure this remains performant as record size increases.

### One-time Writes {#writes}

Although you may choose to do some of the write operations off the `Record` API directly you can do them here too, starting with the basic endpoints:

```ts
const result = await PersonModel.push(newPerson);
const result = await PersonModel.update("1234", { age: 45 });
const result = await PersonModel.remove("1234");
```

The Model also provides a relatively efficient bulk update:

```ts
const result = await PersonModel.updateWhere("age", [">=", 80], {
  elderly: true
});
const result = await PersonModel.updateWhere("age", [">=", 80], (r: Record) => {
  //...
});
```

> **In Depth:**

    In the above example this will first query using the comparative filter to get the id's that remain, then do a "multi-path update" to the database. The multi-path update ensures that all updates are done with a single call to the DB and are treated as a transaction.

## Real-time Event Streams {#events}

### Subscribing

Firebase is a "real-time database" and so therefore one of the best ways of interacting with it is to simply tell the database what "paths" you care about and then let it inform you of changes at these paths through event streams. This model of "reading" may take a little getting used to if you're used to standard request/reply DB interaction but for long-living applications this is definitely a powerful way to manage state between Firebase and your app.

So let's quickly review the types of events that Firebase provides:

1.  **Value Events** - a _value_ event gives you back the entire tree of data at the given path everytime a change takes place. The path you listen to on a value event can be a single value, a Record, or a list of Record but typically its best to use value events for relatively "leaf nodes" which in the case of Firemodel would be a `Record` more than a `List`.
2.  **Child Events** - _child_ events assume that the path being listened to is a `List` of records and then you can choose what things amoungst these children you care about:
    - **child_added** - fires initially for each record in the query resultset but from then on only fires when a new `Record` is added
    - **child_removed** - only fires when an existing `Record` is removed
    - **child_changed** - fires whenever a child `Record` is changed (anywhere in the graph below the Record)
    - **child_moved** - fires whenever a `Record` has changed in it's sort order

Subscribing to state change events in **Firemodel** is done through the `listenTo` and `listenToRecord` methods. For performance reasons, listening to an individual [`Record`](./record.md) will be done with a _value_ event, while listening to a [`List`](./list.md) will be a combination of the _child events_:

```ts
// subscribe to all people events
PersonModel.listenTo(listener);
// subscribe to recent people events
PersonModel.orderByChild("lastUpdated")
  .limitToLast(10)
  .listenTo(listener);
// subscribe to a specific person's data
PersonModel.listenToRecord("1234", listener);
```

### Events

#### Event Types

The events which your listener will receive depend on whether you are listening to a specific RECORD or a LIST:

- **LIST**
  - `@firebase/CHILD_ADDED` - new record
  - `@firebase/CHILD_REMOVED` - record removed
  - `@firebase/CHILD_MOVED` - record in new order (from server perspective)
  - `@firebase/CHILD_CHANGED` - record was modified but still exists
  - `@firebase/MODEL_STATE_READY` - initial state of records has been received
  - `@firebase/RELATIONSHIP_START_LISTENER` - relationship change has added need for listener
  - `@firebase/RELATIONSHIP_END_LISTENER` - relationship change has removed need for listener
  - `@firebase/MODEL_START_LISTENING`
  - `@firebase/MODEL_END_LISTENING`
- **RECORD**
  - `@firebase/RECORD_CHANGED` - record added or updated
  - `@firebase/RECORD_REMOVED` - record removed
  - `@firebase/RECORD_START_LISTENING`
  - `@firebase/RECORD_END_LISTENING`

#### Event Structure {#event-structure}

![](images/event-listener-workflow.jpg)

It might be intuitive to assume that the events our listeners receive are 1:1 representations of what we get from the originating Firebase event but that's not true for two reasons:

1.  Some events do not actually originate from a Firebase event (for example lifecycle events like `MODEL_START_LISTENING`)
2.  Each of the Firebase events are _decorated_ with additional context which the listener can respond to.

All events are typed using Typescript so will be much easier to work with as an external user of this library but here are some basics about the event structure:

All events sent to listeners through the `listenTo` and `listenToRecord` registration methods have at least the following four properties:

- `type` - the event name that is firing
  > **note:** all event types start with `@firemodel/` string
- `model` - the schema/model which this event stream listening to
- `query` - a serialized version of the query string used to start the listener
- `payload` - the primary state change that is being conveyed by this event

For more specifics refer to the type definitions which are found in [`/src/events.ts`](https://github.com/forest-fire/firemodel/blob/master/src/event.ts).

### Listeners and Local State {#listeners}

Up to now we've been focused on subscribing to an event stream but let's now turn our attention to _consuming_ it. Consumption of the event stream is the responsibility of the **Listener** where a listener conforms to the following type:

```ts
export type FiremodelListener = (event: IFMEvent) => void;
```

So if you wanted to setup a listener on the Person model and have it write out to console every time an event fired, you could do the following:

```ts
const listener = (event: IFMEvent) => {
  switch(event.type) {
    case '@firemodel/MODEL_START_LISTENING':
      console.log('MODEL LISTENING');
    case '@firemodel/MODEL_STATE_READY':
      console.log('READY');
    case '@firemodel/RECORD_ADDED':
      console.log('MODEL ADDED');
    case '@firemodel/CHILD_REMOVED':
      console.log('REMOVED');
}
const PersonModel = new Model<Person>(db);
PersonModel.listenTo(listener);
```

Note that the `listenTo` method can also be modified in scope with standard Firebase query operators:

```ts
PersonModel.orderByChild("lastUpdated")
  .limitToLast(10)
  .listenTo(listener);
```

In the above example we've gone through we are attaching the listener to a specific model/schema pairing and this allows you to have different listening behaviour based on the model but in fact in the majority of times you will likely be able to get away with having the same listener _across_ model (this will become even more clear when we look at integration with popular state management frameworks).

Now imagine you started a listener like this:

```ts
const listener = event => {
  switch (event.type) {
    case "@firemodel/MODEL_START_LISTENING":
      console.log("MODEL LISTENING");
    case "@firemodel/MODEL_STATE_READY":
      console.log("READY");
    case "@firemodel/RECORD_ADDED":
      console.log("MODEL ADDED");
    case "@firemodel/CHILD_REMOVED":
      console.log("REMOVED");
  }
};

const PersonModel = new Model<Person>(Person, db);
PersonModel.listenTo(listener);
```

Assuming an initial state of 5 people, your listener (and therefore your console output) should look something like this:

```sh
MODEL LISTENING
ADDED
ADDED
ADDED
ADDED
ADDED
MODEL READY
```

Going forward any of the relevant child listeners (added, removed, moved, changed) will fire if and when the data changes on the backend.

The primary function of a listener is to take an incoming state change from the database and use that to modify the local state. When you pass in your own listener you can go about this any way that suits your needs.

While writing your own event listeners may be needed in some cases, more and more we find that some sort of state management framework like [redux](), [vuex](), or [another]() are being used as the authoritative way to manage state locally. This means that getting these asynchronous Firemodel events into the framework of your choice becomes an important task. Fortunately for redux and vuex we've done most of the work. In the next section we'll explore how this can be done.

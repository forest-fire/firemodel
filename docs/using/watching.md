# Watching for Changes

![](https://media.giphy.com/media/xTiIzrkmUZpP6kYF20/giphy.gif)

One of the really cool things about Firebase is that it is a "real time database" and what this means is that rather than interactions with the database always originating from your code, instead you can simply describe the data you're interested in and let Firebase tell _you_ when something's changed. 

Turning this interaction model around is a real game changer in some applications and useful in most (though maybe not so much backend micro-services). In any event, **FireModel** would be remiss to not fully get behind this way of doing things. So let's first begin by describing the data structure we will see. For those of you familiar with RX this will seem kind of obvious but what "watching for changes" looks like from a data standpoint is a stream of events. 

## Expressing Interest

So how do we express our interest in these events?

```typescript
const dispatch: IFMRecordEvent = (payload) => console.log(payload);

// Listen for changes on a single record
const hashId = await Watch
  .record(Person, "1234")
  .dispatch(dispatch)
  .start();
// Listen for changes on a list of records
const hashId2 = await Watch
  .list.since(Person, 134123543)
  .dispatch(dispatch)
  .start();
```

With these watchers in place we will be called back on `dispatch()` whenever an event fires.

### FireModel Events

There are three category of events you'll get from your Watchers:

| Record Events  | Relationship Events  | Lifecycle Events      |
| -------------- | -------------------- | --------------------- |
| RECORD_ADDED   | RELATIONSHIP_ADDED   | WATCHER_STARTED       |
| RECORD_REMOVED | RELATIONSHIP_REMOVED | WATCHER_STOPPED       |
| RECORD_CHANGED |                      | WATCHER_STOPPED_ALL   |
| *RECORD_MOVED* |                      | FIREBASE_CONNECTED    |
|                |                      | FIREBASE_DISCONNECTED |

The lifecycle events are quite "meta" in that they will not have much of a direct impact on local state but rather just help to trace the sequence of events. The *record* and *relationship* events, however, have very clear impact on state. 

> If you are using Typescript you can import the `FMEvents` enumeration for easy access to each event type

All events are structured as a dictionary and ALL events have the `type` property. To give you a sense of what an event might look like, here's the structure of a record event:

```typescript
export interface IFMFirebaseEventPayload {
  /** the unique identifier of the event type/kind */
  type: keyof FMEvents;
  /** the originator of the event */
  source: "database" | "client";
  /** the name of the Model who's record has changed */
  model: string;
  /** the constructor for the Model of the record which has changed */
  modelConstructor: FMModelConstructor;
  /** the path in Firebase where this Record should is stored */
  dbPath: string;
  /** the path in your local state management where this Record should go */
  localPath: string;
  /** an identifier of which active watcher was triggered to create this event */
  watcherHash: string;
  /** the Record's "id" property */
  key: string;
  /** the key/ID the previous state; provided only on child_moved and child_changed */
  prevKey?: string;
  /** the value of the Record after the change */
  value: T;
}
```

Whereas the _relationship_ events are a superset:

```typescript
export interface IFMRelationshipEvent extends IFMRecordEvent<T> {
  fk: string;
  fkModelName: string;
  fkHasInverse: boolean;
  fkConstructor?: FMModelConstructor;
  fkRelType?: ISchemaRelationshipType;
  fkLocalPath?: string;
}
```

## Losing Interest

If at some later point you decide that one of you watchers is no longer of interest you can remove individual watchers by capturing a returned hash key like so:

```typescript
const hashId = Watch(Record.get(Person, "1234"));
/** passage of time */
Watch.stop(hashId);
```

If you want to cancel all current watchers you can do this with:

```typescript
Watch.stop();
```


## Upward and Onward

We've talked about _what_ watching is and _how_ it works mechanistically but we've not really discussed a practical manner of using it. Don't worry kind reader, we'll get there next in the Advanced topic section under [Frontend State Management](./frontend-state-mgmt.html).


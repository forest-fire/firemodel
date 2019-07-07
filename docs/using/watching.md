---
sidebarDepth: 3
---
# Watching for Changes

![buggy eyeball](https://media.giphy.com/media/xTiIzrkmUZpP6kYF20/giphy.gif)

One of the really cool things about Firebase is that it is a "real time database" and what this means is that rather than interactions with the database always originating from your code, instead you can simply describe the data you're interested in and let Firebase tell _you_ when something has changed.

Turning this interaction model around is a real game changer in some applications (including most modern frontend apps). In this section we will explore how 

## Expressing Interest

So how do we express our interest in these events?

```typescript
const dispatch: IFMRecordEvent = (payload) => console.log(payload);

// Listen for changes on a single record
const { watchId:watch1 } = await Watch.record(Person, "1234")
  .dispatch(dispatch)
  .start();
// Listen for changes on a list of records
const { watchId:watch2 } = await Watch.list(Person)
  .since(134123543)
  .dispatch(dispatch)
  .start();
```

> **Note:** you _do not_ have to specify the dispatch on calls to `Watch` so long as your dispatch function has been set on `FireModel.dispatch`.

> **Note:** the call to `start()` returns a Promise to a [`IWatcherItem`](https://github.com/forest-fire/firemodel/blob/master/src/Watch.ts#L44) object

With these watchers in place we will be called back on `dispatch()` whenever an event fires.

### State Synchronization

Note that because when we first declare the intent to watch a DB path, the app will always be out of sync with the database so you should expect that as quickly as you get connected to the DB and the query is run the first event will be fired. This initialization sequence is important to understand. You _can_ call `Watch` as a synchronous function and the watcher will start but if you treat it as an _async_ function the function will return once the Watch has synchronized.

## Losing Interest

If at some later point you decide that one of you watchers is no longer of interest you can remove individual watchers by capturing a returned hash key like so:

```typescript
const { watchId } = Watch.record(Person, "1234").start();
/** passage of time */
Watch.stop(watchId);
```

If you want to cancel all current watchers you can do this with:

```typescript
Watch.stop();
```

## Where to use Watchers

We've talked about _what_ watching is and _how_ it works mechanistically but we've not really discussed a practical manner of using it. There are two typical use-cases where watchers are used:

1. Long running server processes
2. Frontend applications (typically running an SPA)

In both cases the common thread is a long running Javascript thread which enables the efficient use of Firebase's websocket connection to not only _send_ updates to the database but also to ensure that the locally cached state is kept current. Where watchers are less useful is in a serverless function or any situation where there is a very short execution lifespan. 

In the [Frontend State Management](./frontend-state-mgmt.html) we cover a powerful way to integrate **Firemodel** with a Frontend State Management solution but before reading that be sure to have a look at the next section ([Responding to Events](./dispatch-and-events.html))  to better understand what *events* are available and how to connect into them.

---
sidebarDepth: 3
---
# Responding to Events

**Firemodel** has two related concepts of _events_ and _dispatch_; at a summary level they are:

- `Events` - an asynchronous means of signalling change in either the database (aka, CRUD events) or the state of Firemodel (aka, non-CRUD events)
- `Dispatch` - a way of plugging into the event stream produced by Firemodel, so that your application can respond to events

In the following two sections we will explore both in more detail.

## Events

Let us first explore the events which we may be encountering when using FireModel.

### CRUD Events

When it comes to CRUD based events, there are two primary categories of events/mutations you'll get from a Watcher:

| Locally Originated  | Server Confirm  | Server Originated |
| -------------- | -------------------- | ----- |
| RECORD_ADDED_LOCALLY   | RECORD_ADDED_CONFIRMATION | RECORD_ADDED |
| RECORD_REMOVED_LOCALLY | RECORD_REMOVED_CONFIRMATION | RECORD_REMOVED |
| RECORD_CHANGED_LOCALLY | RECORD_CHANGED_CONFIRMATION | RECORD_CHANGED |
| *RECORD_MOVED_LOCALLY* | *RECORD_MOVED_CONFIRMATION* | RECORD_MOVED |
|                | RECORD_ADDED_ROLLBACK |
|                | RECORD_REMOVED_ROLLBACK |
|                | RECORD_CHANGED_ROLLBACK |
|                | *RECORD_MOVED_ROLLBACK* |

How you encounter these events will depend on whether the frontend app is _originating_ the state change or it is passively receiving an event from some other actor.

#### Origination Flow

For example sake, imagine that our frontend app has just executed the following:

```typescript
await Record.add(Person, { name: "bob", age: 45 });
```

In this example we are originating an record being added; the event flow would look like this:

<process-flow>graph LR;Event("RECORD_ADDED_LOCALLY")-->Outcome{"success on DB?"}; Outcome-->|yes|Confirmation["RECORD_ADDED_CONFIRMATION"]; Outcome-->|no|Rollback["RECORD_ADDED_ROLLBACK"]; style Rollback stroke: red,stroke-width:2;</process-flow>

This is a classic example of a "two phased commit". As soon as we execute the command the local update is sent out. When the server responds we either accept the local change or roll it back.

> It is important to understand that both phases of this two phase commit are provided by Firemodel CRUD operators like `Record.add()`, `Record.remove()`, etc. That means even with NO watchers setup you _will_ get these events (so long as you've hooked up the dispatch function).

#### External Event Flow

Alternatively, in the case of an event which was triggered from an external agent/actor, the event flow is just a singular event. There is no _local_ event and there would never be a case of a _rollback_ or _confirmation_ either. The watching app would simply get notification of changes which _have happened_ to paths you are watching on.

<process-flow>graph TB;Event("External Event")-->ADD["RECORD_ADDED"];Event-->Change["RECORD_CHANGED"];Event-->Remove["RECORD_REMOVED"]; Event-->Moved["RECORD_MOVED"]</process-flow>

### Non CRUD Events

While the CRUD events are typically of greatest interest there are also some _lifecycle_ events which are broadcast as well:

| LifeCycle Events | Description |
|----|----|
| WATCHER_STARTED   | a new watcher has been added to local app |
| WATCHER_STOPPED       | a watcher established locally has been stopped |
| WATCHER_STOPPED_ALL   | all locally watched events have been stopped |
| FIREBASE_CONNECTED    | the firebase database has been connected |
| FIREBASE_DISCONNECTED | the firebase database has been disconnected |

The lifecycle events are quite "meta" in that they will not have much of a direct impact on local state but rather just help to trace the sequence of events.

### Enumerating Events

If you are using TypeScript you can import the `FMEvents` enumeration for easy access to each event type:

```typescript
import { FMEvents } from 'firemodel';

if (event.type === FMEvents.WATCHER_STOPPED) { ... }
```

### Event Payload

All events are:

- structured as a dictionary/hash
- has a `type` property to indicate what event has been fired
- has a `value` property which indicates the *payload* of the event
- has a `transactionId` which is assigned to all related events (this helps in two phase commits)
- if the CRUD event is an "update" then there will be the following properties:
  - `changed` which indicates the properties which have changed
  - and `priorValues` which indicates the prior values

An attempt is made to match every event to a Watcher (or Watcher**s** plural if appropriate) and if it is able to then the watcher's ID and source (e.g., 'list', 'record') will be added to the payload too (`watcherId` and `watcherSource`). This additional detail may be important for a generalized handling of events in your frontend state management solution (see [Frontend State Mgmt](/using/frontend-state-management.html) section).

> Note: when the event is being _sent_ directly to a watcher it will always be associated to a watcher but locally originated CRUD events need to be explicitly matched to watchers.

For a complete reference of the properties included in an event refer to the `IFmEvent` interface.

## Dispatch

# Watching for Changes

![](https://media.giphy.com/media/xTiIzrkmUZpP6kYF20/giphy.gif)

One of the really cool things about Firebase is that it is a "real time database" and what this means is that rather than interactions with the database always originating from your code, instead you can simply describe the data you're interested in and let Firebase tell _you_ when something's changed. 

Turning this interaction model around is a real game changer in some applications and useful in most (though maybe not so much backend micro-services). In any event, **FireModel** would be remiss to not fully get behind this way of doing things. So let's first begin by describing the data structure we will see. For those of you familiar with RX this will seem kind of obvious but what "watching for changes" looks like from a data standpoint is a stream of events. 

## Expressing Interest

So how do we express our interest in these events?

```typescript
// Listen for changes on a single record
Watch(Record.get(Person, "1234"), dispatch);
// Listen for changes on a list of records
Watch(List.recent(Company, 25), dispatch);
```

In this example we see two different expressions of interest. In one case it's just a single `Person` record where we'd like to be informed. In the second we're passing in a query to get and keep updated on the most recent `Company`'s. In both cases we pass in a function called `dispatch` which is a callback that gets called whenever an event is fired.

### Firebase Events

Now let's get a little more under the covers of what is going on. First off, if you're familiar with Firebase events you'll know there are five of them:

- **value** - returns a specified part of the state tree every time any part of it is changed
- **child_added** - when a node is added directly under the stated area of interest this event will fire
- **child_removed** - when a node is removed directly under the stated area of interest the old (now deleted) value is fired as an event.
- **child_changed** - when an existing node has changed, an event will be fired for each of the direct decendants which have changed.
- **child_moved** - an event is fired when a child's sort order changes relative to its siblings.

**FireModel** associates the _value_ event with interests in single records, it associates all of the _child_-events with lists of records. This may be interesting but in many ways it's all hidden away from you. What is arguable more important is what the events which are triggered looks like.

### Dispatch Events

When an event fires a simple hash/dictionary is passed to whatever function is passed into the `Watch` as `dispatch`. Each event type is slightly different but as similar as possible. Here are a few examples (all events are typed in Typescript):

```typescript
// VALUE event
{
  type: string = "@firemodel/VALUE_EVENT",
  source: "database" | "client"  = "database",
  model: string = "[ModelName]",
  modelConstructor: () => T = fn,
  dbPath: string = "authenticated/people/1234",
  localPath: string = "/people/1234",
  watcherHash: string = "xFDkdsas983",
  /** the model that's being watched */
  value: T extends Model = { ... }
}

// CHILD_ADDED event
{
  type: string = "@firemodel/CHILD_ADDED",
  source: "database" | "client"  = "database",
  model: string = "[ModelName]",
  modelConstructor: () => T = fn,
  dbPath: string = "authenticated/people/1234",
  localPath: string = "/people/1234",
  watcherHash: string = "fGHkdaay623",
  previousChildKey: string = "-L4564023432",
  /** the new model that's been added to the list */
  value: T extends Model = { ... }
}

// CHILD_REMOVED event
{
  type: string = "@firemodel/CHILD_REMOVED",
  source: "database" | "client"  = "database",
  model: string = "[ModelName]",
  modelConstructor: () => T = fn,
  dbPath: string = "authenticated/people/1234",
  localPath: string = "/people/1234",
  watcherHash: string = "fGHkdaay623",
  previousChildKey: string = "-L4564023432",
  /** the model that's been removed from the list */
  value: T extends Model = { ... }
}
```

You get the pattern. Also, if you've used Redux, Vuex, or other modern frontend state management frameworks you can see how this message structure would be pretty easy to incorporate. For more details look the Advanced Topics under [Frontend State Management](./frontend-state-mgmt.html).

## Losing Interest

If at some later point you decide that one of you watchers is no longer of interest you can remove individual watchers by capturing a returned hash key like so:

```typescript
const cancelationKey = Watch(Record.get(Person, "1234"));
/** passage of time */
Watch.off(cancelationKey);
```

If you want to cancel all current watchers you can do this with:

```typescript
Watch.off();
```

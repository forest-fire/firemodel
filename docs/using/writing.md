# Writing

## Background

The basic mechanics of writing to the database using the Firebase SDK consists of applying a `set`, `push`, `update` or `remove` to a Firebase reference. For instance, let's say you wanted to add a new user "Bob":

```typescript
await db.ref(`authenticated/people`).push({
  name: "Bob",
  age: 66
});
```

This will do the trick. Since you "pushed", Firebase will create an ID for you (referred to as a "pushkey" in Firebase parlance). If I wanted to state the ID/key myself I could use `set` instead:

```typescript
await db.ref(`authenticated/people/4567`).set({
  name: "Bob",
  age: 66
});
```

In general the "push" approach is considered better and people will think more highly of you when you use it (but who cares what they think right?) but let's not get into a Firebase SDK discussion. It's just being brought up here as a way of illustrating the way we're used to executing write or "destructive" actions on the database.

### Multi-path Updates

Before we entirely leave the "this is Firebase" section we need to bring up "multi-path updates (MPU)" which are a very powerful feature but rather poorly named. What are MPU's? They are a way to change multiple paths in the database as one atomic transaction. It is poorly named because of what is really happening isn't an "update" more than a "set".

To achieve this feature in the SDK you'd do something like:

```typescript
await db.ref(`authenticated/people`).update([
  {"1234/name", "Joey"},
  {"1234/age", 16},
  {"456": {
    name: "Colleen"
  }}
])
```

In the case of the `1234` key we are using this feature correctly and _setting_ discrete properties on the person record. If, for instance, person 1234 had previously had a property `favoriteColor` set to "blue" this would remain set. In contrast, the `456` key may be more destructive than you'd expect from an operation called "update". This will indeed set the name property `name` to "Colleen" but any other properties hanging off of this record will have been lost.

## A Step Forward

As was mentioned in the "getting started" section, the underlying DB operations that **FireModel** uses are
leveraging the **AbstractedFirebase** library. We won't spend much time on it but let's quickly review how we can do the above operations in either of the consumable libraries which wrap **AbstractedFirebase**.

```typescript
const db = new DB();
// set
await db.set('authenticated/people/4567', { ... });
// push
const id = await db.push('authenticated/people', { ... });
// non-destructive update
await db.update('authenticated/people/4567', { ... });
// remove
await db.remove('authenticated/people/4567');
```

Nothing terribly surprising or exciting. A bit more compact in form. The `push` operation returns the new "id" which you don't get in the SDK. But overall not very different until you get to the multi-path update (which should be thought of as a multi-path _set_).

The first change is that if you use the `db.update(...)` method and pass in a MPU data structure you'll get an error suggesting the `multiPathSet()` method. The `multiPathSet` is appropriately named and offers a nicer syntax for implementing (IMHO).

Let's replicate the MPU from above with this new syntax:

```typescript
const mpu = db.multiPathSet("authenticated/people/4567");
mpu.add({ path: "name", value: "Joey" });
mpu.add({ path: "age", value: 16 });
await mpu.execute();
```

The interface follows the "fluent api" approach so you can compact all of these lines into a single line if you so desire but it is often quite powerful to build up the path over time in your code and then execute it when it's complete.

## Contextual Writing

We are now ready to talk about a more _contextual_ style of writing to the database that stems from **FireModel**'s schema awareness and opinionated base data structure. Let's use the simple non-destructive update of a person's name and age:

```typescript
const joe = Record.get(Person, 4567);
await joe.set("name", "Joey");
await joe.set("age", 16);
```

This achieves the goal but goes a step further. Each call to `set` not only sets the property on the database but also transparently updates the `lastUpdated` property that all schemas inherit from `BaseSchema`; this was done as a single atomic transaction. Further, the path to where "people" are stored in the database is not required as it's built into the schema definition. Nice.

The above example is _good_ but we want you to be _excellent_. Above we sent two updates to the database -- and that might be what we wanted -- but in most cases we'd like to update "name" and "age" at the same time and this possible too:

```typescript
const joe = Record.get(Person, 4567);
await joe.update({ name: "Joey", age: 16 });
```

Here we get the both properties plus the `lastUpdated` update as a single non-destructive DB transaction.

Finally, if you liked the decomposed approach of building up a MPU that was illustrated in the "[A Step Forward](#a-step-forward)" section, you can do something quite similar with **FireModel** too:

```typescript
const joe = Record.get(Person, 4567);
const mpu = joe.multiPathSet();
mpu.add({ path: "name", value: "Joey" });
mpu.add({ path: "age", value: 16 });
await mpu.execute();
```

In this example it doesn't seem all that adventagous but in deeply nested records this can be much easier to grok. Maybe the better example is actually showing this in interaction with with a `List`:

```typescript
const people = List.all(Person);
const mpu = people.multiPathSet();
mpu.add({ path: "4567/name", value: "Joey" });
mpu.add({ path: "1234/age", value: 16 });
await mpu.execute();
```

---
sidebarDepth: 3
---
# Model Constraints

## Overview

Our first example was pretty basic and in our second one we're only going to add a bit but they are important changes to understand:

```typescript
@model({
  dbOffset: 'authenticated',
  localPrefix: 'in.the.tree',
  plural: 'peeps',
  audit: true
})
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
}
```

Maybe not surprisingly the "model constaints" are meta properties about your model as a whole (versus on a specific property). Let's review the options highlighted above ...

## Database Offseting

 The `dbOffset` property tells **Firemodel** that all Person records should be saved to the database off of the "authenticated" data path. This string can contain both static paths and _dynamic_ paths. The dynamic paths are denoted by prefixing the offset with a colon. Here are two examples:

```typescript
// static prefix
@model({ dbOffset: "foo/bar" })
export class Anything extends Model {}
```

and as a _dynamic path_ example:

```typescript
// dynamic prefix
@model({ dbOffset: ":foo/bar" })
export class Anything extends Model {}
```

in the dynamic prefix example, it is assumed that the model has a property named `foo` and that the records will be stored in the database according to the value of the `foo` property. For more details on why you might want to use dynamic paths refer to the section [**Modeling → Dynamic Paths**](./dynamic-paths), if you just want to know how to run queries or setup watchers on models with dynamic paths then check out: [**Using → Dynamic Paths**](../using/dynamic-paths)

## Frontend State Management

The `localPrefix` / `localPostfix` properties are used to help get `Watch` events into the right part of the client state management tree. To understand how they effect to the resultant **localPath** values found in the _dispatched_ events we need to distinguish between the `Watch` of a **Record** versus a **List**. So, given a model defined as:

```typescript
@model({ localPrefix: "foo/bar", localPostfix: "baz" })
export default class Person extends Model {...}
```

when watched in a client app like this:

```typescript
await Watch.record(Person, "1234").start();
```

The resulting dispatches (e.g., RECORD_ADDED, RECORD_CHANGED, etc.) will have a `localPath` property of: `/foo/bar`. This may be surprising at first but it makes sense when you consider that in a majority of cases you are watching on a record (versus a list) when you only want a single record of that type.

Bear in mind that there could be some edge cases where this isn't the case and for these you should use a dynamic notation on one of the properties of the model (typically the "id"). By example if the `localPrefix` had been `foo/bar/:id` then it would have resolved the `dbPath` to `foo/bar/1234`.

> Note: if _no_ `localPrefix` is set for a given model and there is a _record_ based watcher placed on the database, the `localPath` will be set to the singular model name

In all Record-based Watch's the `localPostfix` property is ignored but List-based Watch's are a bit different. Using our example above as the template, imagine:

  ```typescript
await Watch.list(Person).all().start();
```

In this case, there may be several records returned initially as a RECORD_ADDED dispatch. For the record of id "1234" the dispatch payload would include:

```typescript
{
  id: "1234"
  localPath: "foo/bar/people/baz",
  // ...
}
```

Unfortunately our use of an _explicit_ value for `localPostfix` is maybe a bit confusing. Typically you would NOT set this value and then the type of list query type would determine the postfix for you. The default value for postfix is "all" and the localPath becomes `foo/bar/people/all`.

This fits into a very standard convention you find on a lot of frontend state management frameworks which allows for the primary "data" for a given model to be offset on `.all` or comparable which allows the base node (aka, `foo/bar/people` in this example) to contain getters which modify or filter the base data. This base node can also contain various meta attributes. For instance, let's assume you have a product catalog that is divided by region but a customer travels between two of these regions. You might imagine the following state tree:

```typescript
products: {
  all: [ ... ], // the result of the two Watchers below
  currentRegion: "abc",
  previousRegion: "def",
  current: [ ... ], // a GETTER which filters to the "currentRegion"
}
```

Where you are populating the `products/all` property with:

```typescript
Watch.list(Product).where("region", currentRegion).start();
Watch.list(Product).where("region", previousRegion").start();
```

## Other Model Constraints

1. `plural` - by default **Firemodel** will pluralize your model name using standard rules. It should get it right most of the time but if you want to override this you can here. The reason the plural name is brought up is that the plural name is used in the storage path for both Firebase and your frontend state management.
2. `audit` - in cases where the given model holds very sensitive data you may want to opt-in to having all changes _audited_. For more on this see the [Auditing subsection](../using/auditing.html) in the Using section.

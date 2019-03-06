---
sidebarDepth: 3
---
# Model Constraints

## Outline

Our first example was pretty basic and in our second one we're only going to add a bit but they are important changes to understand:

```typescript
@model(
  dbOffset: 'authenticated',
  localPrefix: 'in.the.tree',
  plural: 'peeps',
  audit: true)
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
}
```

Maybe not surprisingly the "model constaints" are meta properties about your model as a whole (versus on a specific property). Let's review the options highlighted above ...

### Database Offseting

 The `dbOffset` property tells **FireModel** that all Person records should saved to the database off of the "authenticated" data path. This string can contain both static paths and _dynamic_ paths. The dynamic paths are denoted by prefixing the offset with a colon. Here are two examples:

```typescript
// static prefix
@model({ dbOffset: "foo/bar" })
export class Anything extends Model {}
```

and

```typescript
// dynamic prefix
@model({ dbOffset: ":foo/bar" })
export class Anything extends Model {}
```

in the dynamic prefix example, it is assumed that the model has a property named `foo` and that the records will be stored in the database according to the value of the `foo` property. Why this functionality has been provided is due to a limitation of the Firebase Real Time database, to understand more see below in the "Getting around the Firebase Query Limitation" section.

### Frontend State Management

The `localPrefix` / `localPostfix` properties are used to help get `Watch` events into the right part of the client state management tree. To understand how they effect to the resultant **localPath** values found in the _dispatched_ events we need to distinguish between the `Watch` of a **Record** versus a **List**. So, given a model defined as:

```typescript
@model({ dbPrefix: "foo/bar", dbPostFix: "baz" })
export default class Person extends Model {...}
```

when watched in a client app like this:

```typescript
await Watch.record(Person, "1234").start();
```

The resulting dispatches (e.g., RECORD_ADDED, RECORD_CHANGED, etc.) will have a `localPath` property of: `/foo/bar`. This may be suprising at first but it makes sense when you consider that in a majority of cases you are watching on a record (versus a list) when you only want a single record of that type.

Bear in mind that there could be some edge cases where this isn't the case and for these you should use a dynamic notation on one of the properties of the model (typically the "id"). By example if the `localPrefix` had been `foo/bar/:id` then it would have resolved the `dbPath` to `foo/bar/1234`.

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

### Other Model Constraints

1. `plural` - by default **FireModel** will pluralize your model name using standard rules. It should get it right most of the time but if you want to override this you can here. The reason the plural name is brought up is that the plural name is used in the storage path for both Firebase and your frontend state management.
2. `audit` - in cases where the given model hold very sensitive data you may want to opt-in to having all changes _audited_. For more on this see the [Auditing subsection](../using/auditing.html) in the Using section.

## Getting around a Firebase Query Limitation

### The Problem Statement

The Firebase **Real Time Database** is great but it has certain limits and one of the most notable is that it can only filter records in a query by a single parameter (note: this limitation is removed in the Firestore DB). If you need to filter by more than one the traditional suggestion is to do this on the client side. To illustrate this, let's take a look at a piece of SQL that maybe people will relate to:

```sql
SELECT * from Products where geoCode = "12345" AND status != "archived";
```

This is a totally reasonable SQL query but in Firebase the `AND` clause is not an option. So does this matter? It turns out that in many cases it does not. 

Typically in modern SPA's you want to bring a data type in large part into the client state management framework (e.g., Redux, Vuex, etc.) and then use GETTERs to reduce that state or shape it on the framework. In other cases, there is a genuine need to reduce the data coming back from the server but that can be done prior to mutating (*adding/updating*) it into the client's state management framework.

### Introducing Dynamic Offsets

So in all the cases above you'll be fine working within Firebase's limitation but there are cases where you may consider  moving outside it. Let's assume, for instance, that:

- you have a bunch of data entities are are all geographically constrainted to a particular area
  - Some of our data entities -- let's say `Product` and `Order` -- are geographically constrained to a given state
  - Both `Product` and `Order` have the potential to grow to a large number of record
  - These data entities both have `state` as a property hanging off their definitions
- at the same time, our data model has other data entities which are global in their geographic scope. Let's say `UserProfile` is an example

So what we _can_ do Firebase is segment our data for the geographically separate content on a state-by-state data path. So following our example, if we had two products ... one from Connecticut and one from Massachusetts, we would see them placed in the database state tree like so:

```typescript
{
  states: {
    "CT": {
      products: {
        "productId1": { ... product ... }
      }
    },
    "MA": {
      products: {
        "productId2": { ... product ... }
      }
    }
  },
}
```

This means that Connecticut products are at a different path from Massachusets products.This also means that if we're looking for Connecticut products we can point at `/CT/products` and _still_ have a filter available to our query.

### How to use in FireModel

The first step is to configure a model to have the dynamic offset, following from our prior example that is done like so:

```typescript
@model({ dbOffset: 'states/:state' })
export default class Product extends Model{ ... }
```

This definition gives us the static "states" prefix and then tells FireModel that `state` should be considered a dynamic part of the prefix for the model.

From a modeling standpoint that is all that's required. However, `Product` now has some additional requirements in usage. Let's review these changes here briefly and they will be discussed again in the [Usage](/using/) section as well.

#### Getting Records

With a non-dynamically pathed model you would get a record like so:

```typescript
const product = Record.get(Product, "prod-id");
```

However, in a dynamically pathed model the "id" is no longer enough because to gain access you will need a _composite key_ which includes the *state* in this example. To achieve the same results one would instead:

```typescript
const product = Record.get(Product, { id: "prod-id", state: "CT" } );
```

This will work fine and makes sense when you consider that `id` along with `state` now represent the true primary key for the record. This approach works equally as well with `remove` and `update`.

#### Adding records

In the case you want to add a new Record you actually don't need to make any changes just so long as you include values for the properties which make up the composite key :

```typescript
const product = Record.add(Product, { id: "prod-id", state: "CT", ... } );
```

To help ensure this, always type keys which are part of you composite key as required.

#### Adding FK Relationships

If you're establishing a FK relationship _from_ a model which has dynamic path to one which does not then the API remains the same. If you are operating in reverse you will need to do one of two things:

1. **Full composite key.** In the example below the FK reference is to a model which has `foo` and `bar` as part of the dynamic path. By stating the explicit values of the composite key the FK will always work.

     ```typescript
     originatingModel.addToRelationship('fkPropertyOnOriginating', {
         id: "[ID VALUE]",
         foo: "abc",
         bar: "def"
      });
     ```

     > Note: `setRelationship` for 1:1 cardinality based relationships take the same syntax

2. **Passthrough.** If the originating model has property values for all of the dynamic segments in the FK then you can simply state the ID as a string (this is just the standard API syntax) and it will assume that the PK and FK have the same values for these properties. 

     ```typescript
     originatingModel.addToRelationship(
       "fkPropertyOnOriginating",
       "[ID VALUE]"
     );
     ```

#### Getting Lists

This is where there is the biggest departure in terms of results but an attempt has been made to keep the API unchanged. Let's start out with the standard syntax using FireModel:

```typescript
await List.where(Product, "status", "complete");
```

This doesn't work for hopefully obvious reasons (aka, there is no _singular_ list for Product but rather one per state). Instead, when working with a model with dynamic paths you should write:

```typescript
await List.offsets({ state: "CT" }).where(Product, "status", "complete");
```

Adding the `offsets()` API now brings you back to the standard API which **List** exposes but sets the scope of it a particular `state`.

> **Note:** in this example it is `state` which completes the _composite key_ but it could be any number of props which are set as dynamic path segments. Refer to your model definition's `pathOffset` to be sure.

#### Mocking Data

Mocking model's which have dynamic offsets/prefixes leverages one of two strategies:

1. **Explicit Override.**
    The `generate()` method that hangs off of Mock allows you to override mocking for a set of properties and by including the property which has the prefix you are holding it constant and thereby producing a reasonable result (e.g., *reasonable* because a prefix property should always be a bound set of values not a random mock)

    ```typescript
     await Mock(Product, db).generate(10, { state: "CT" });
    ```

    If you wanted to mock several different *states* (in this example) then you could simple have a line item for each.
2. **Constrained Mocks**.
    There are two _named mocks_ which you can use to your advantage to maintained a constrained set of mocks. They are `random` and `sequence`; both take a discrete set of values as options and therefore they result in a natural data pattern for mocked data. Here is an example where we use both. The model would be:

     ```typescript
    @model({ dbOffset: ':state/:category' })
    export default Product extends Model {
      // ...
      @property @mock("sequence", "CT","MA") state;
      @property @mock("random", "Groceries", "Cosmetics") category;
    };
    ```

    And then the Mock would look like:

    ```typescript
     await Mock(Product, db).generate(10);
    ```

    The this example there would be an even distribution of products between "CT" and "MA" and the products which have a random distibution between "Groceries" and "Cosmetics".

Both of these methods are possible but it is considered best practice that you set each model which has a dynamic offset to a mock that constrains to a reasonable set and then you can apply exceptions where needed. This "best practice" becomes essential if you're Mocks are using the "followRelationships()" method.

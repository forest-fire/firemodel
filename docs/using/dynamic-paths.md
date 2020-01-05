# Dynamic Paths (using)

## Introduction

The term _dynamic-paths_ refers to the use of the [Model Constraint](../modeling/model-constraints.html#database-offseting) property **dbOffset** and specifically the inclusion of a non-static path such as `:group` in that property. Use of dynamic paths is typically reserved for situations where certain the records of a given `Model` is divided in large part by a property (or multiple properties) and you want to preserve the ability to query and filter results on the server side beyond these variables or want more fine grained control over the security/permissions of the data in Firebase.

For more on _why_ you might want to use dynamic paths refer to the [**Modeling → Dynamic Paths**](../modelling/dynamic-paths) section.

## Composite Keys

When you are using normal database paths than the `id` property of any given record represents the primary key for the record. Once you've moved to dynamic properties the `id` no longer is guarenteed to provide uniqueness (it _could_ be unique but there is no assurance of that). For this reason the idea of a _composite_ (or compound) key is important to understand.

A composite key is a dictionary of key/value pairs which _together_ provide a uniqueness gaurentee for records that reside on a dynamic path. In **Firemodel** they are represented in two ways:

```typescript
// an object representation
const compositeKey = {
  id: "12345",
  group: "first-group"
}
// a string representation
const compositeRef = "12345::group:first-group";
```

In some ways these internals aren't critical but they can be helpful in understanding. For instance, relationships will always use the string-based FK references. Alternatively, the object based syntax is more intuitive in normal usage (see API below).

## CRUD

In all CRUD activities the API surface remains consistent but the key is that unlike in non-dynamic paths where you only need an `id` you need the full composite key.

### Getting a Record

```typescript
// using object notation
const product = Record.get(Product, { id: "prod-id", state: "CT"} );
// using string reference notation
const product = Record.get(Product, "prod-id::state:CT" } );
```

### Adding a Record

In the case you want to add a new record you actually don't need to make any changes so long as you include values for all the properties which make up the composite key:

```typescript
const product = Record.add(Product, { id: "prod-id", state: "CT", ... } );
```

### Updating a Record

```typescript
const product = Record.update(Product, { id: "prod-id", state: "CT"}, { ... } );
```

### Removing a Record

```typescript
const product = Record.remove(Product, { id: "prod-id", state: "CT"} );
```

### Getting a `List`

Unlike operating with `Record`, `List`'s need a little more work to build in the _offset properties_ needed to build out their database path. This is achieved by adding an `offsets` to the _options_ parameter passed in:

```typescript
const offsets = { state: 'CT' };
const products = List.all(Product, { offsets });
const products = List.where(Product, 'status', 'active', { offsets });
```

## Watching

### Watching a Record

As is true for the CRUD operations, the watching of a record is effectively unchanged except that one must ensure that all keys of the required composite key are included.

```typescript
const { watchId } = await Watch.record(Product, { id: "1234", state: "CT" })
```

### Watching a List

Similar to the CRUD API, we must explicitly state the non-`id` properties of the composite key. We can do that by adding the offsets as a property of `options` or directly in the `offsets()` function:

```typescript
// add as part of options
const offsets = { state: "CT" };
const { watchId } = await Watch
  .list(Product, { offsets })
  .all()
  .start();

// add with the `offsets()` method
const { watchId } = await Watch
  .list(Product)
  .offsets({ state: "CT" })
  .all()
  .start();
```

### Relationships

Adding FK Relationships

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

## Mocking

Mocking model's which have dynamic offsets leverages one of two strategies:

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

    In this example there would be an even distribution of products between "CT" and "MA" and the products which have a random distibution between "Groceries" and "Cosmetics".

Both of these methods are possible but it is considered best practice that you set each model which has a dynamic offset to a mock that constrains to a reasonable set and then you can apply exceptions where needed. This "best practice" becomes essential if you are using Mocks with the `followRelationships()` method.

## Utility Functions

**Record**'s API surface has a few useful utility functions for working with dynamic paths:

- `dbPath` - is not new but it now responds with the dynamic path rather then just pushing out a static string as defined in _dbOffset_.
- `hasDynamicPath` - a boolean flag indicating if underlying Model has dynamic segments
- `dynamicPathComponents` - an array of the properties which are dynamic for the underlying Model.
- `compositeKey` - returns the composite key for the underlying Model; will throw error if all required parameters are not yet set
- `compositeKeyRef` - returns the composite key as a string


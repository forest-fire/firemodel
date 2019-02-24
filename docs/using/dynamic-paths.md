# Dynamic Paths

> available as of FireModel `0.17.0`

## Introduction

The term _dynamic-paths_ refers to the use of the [Model Constraint](../modeling/model-constraints.html) property **dbOffset** and specifically the inclusion of a non-static path such as ":group" in that property. Use of dynamic paths is reserved for situations where certain parts of your data is divided in large part by a property (or more) in your model and you want to preserve the ability to query and filter results on the server side beyond these variables.

Deciding to use dynamic paths should be done with caution but it can open up performance benefits which are worth having for some applications. To understand the basics of why you might do this and how to use Models which have dynamic paths you should review the section [XXXX](../modeling/model-constraints.html#).

## Deep Dive

The remainder of this section is a deep dive to explain the complexities that _dynamic-paths_ introduce to Firemodel.

### Records and the Composite Key

Models with dynamic segments are largely unchanged in terms of the API with one exception. To uniquely identify a Record you need to state more than just an "id" and that's because at this point the unique identifier for a record has become a "composite key". In **FireModel** there are two ways of identifying a composite key. Let's take the example of a `Product` with the following properties:

```typescript
{
  id: "1234",
  group: "foobar",
  name: "Jungle Gym"
}
```

In this example we'll assume the **dbOffset** has been set to `offset/:group` which makes the `group` property a "dynamic segment". Now let's loook at some code which interacts with this configuration.

#### The Composite Key

The composite key from the example from the above setup can be represented two ways:

- Object Notation:

  ```typescript
  {
    id: "1234",
    group: "foobar"
  }
  ```

- String Notation: `1234::group:foobar`

Typically it would be better to use the Object notation when sending in a composite key programmatically but both are fine. With **fk** referenencing FireModel uses string notation internally. That means that you should be careful to not use the `:` character in your dynamic properties.

Here's two valid examples of instantiating a **Record** with a composite key:

```typescript
const product1 = await Record.get(Product, { id: "1234", group: "foobar" });
const product2 = await Record.get(Product, "1234::group:foobar")
```

With this understanding you'll understanding the typing found in [`record-types`](https://github.com/forest-fire/firemodel/blob/master/src/%40types/record-types.ts):

```typescript
export type ICompositeKey = IDictionary<string | number> & { id: string };
export type IFkReference = fk | ICompositeKey;
```

> `fk` is just an alias for `string`

#### Record's API surface for Dynamic Paths

**Record**'s have gotten a few additions to their API surface that might be useful when working with dynamic paths:

- `dbPath` - is not new but it now responds with the dynamic path rather then just pushing out a static string as defined in _dbOffset_.
- `hasDynamicPath` - a boolean flag indicating if underlying Model has dynamic segments
- `dynamicPathComponents` - an array of the properties which are dynamic for the underlying Model.
- `compositeKey` - returns the composite key for the underlying Model; will throw error if all required parameters are not yet set
- `compositeKeyRef` - returns the composite key as a string

### Relationships and Mocks

It's when we start talking about _relationships_ and _mocks_ of relationships that things become more complicated. In order to tackle this topic, let's look at the testing strategy which was used to test relationships:

![test strategy](./assets/test-strategy.png)

As this mindmap suggests, there are a lot of ways that model's can relate (and this diagram only illustrates some of them). On the one hand, however, relating one model to another is a pretty straight forward thing. Adding _dynamic paths_ simply means that instead of using `fk` which just points to the other record's `id` we must point to the **Composite Key**. Also, it has been mentioned previously that in the case of FK's we use the string based notation that you can get from `record.compositeKeyRef`. So what's so complicated?

Well from a testing standpoint there are a lot of edge cases but let's not worry ourselves over that level of detail. If you want to understand it check out the tests in [`dynamic-offset-spec.ts`](). What we do want to cover is the following subtlies of mock data that we will want to create:

- **Signature.** Does a model with a dynamic path referencing another model with the same dynamic signature always relate to the same path? In other words, if both a `Product` and `Order` are dynamically pathed on a specific `geo`; should there be a rule that forces Mock to observe that rule?
- **Reflexive.** What about the same situation as above but where `Product` has an inverse relationship to itself?
- **Passthrough.** When you execute generate() you can state a set of "exceptions" which the Model you're mocking should set to a static value. Typically that means

#### Path Behavior

All of these conditions _matter_ when you're trying to build quality business data. Fortunately the first two conditions can be specified in your mocks. Here's how you do it:

```typescript
const products = Mock(Product, db).dynamicPathBehavior('signature').generate(10);
const products2 = Mock(Product, db).dynamicPathBehavior('signature-exact').generate(10);
const products3 = Mock(Product, db).dynamicPathBehavior('reflexive').generate(10);
```

In the first case (using "signature") _all_ relationships which share a common set of dynamic attributes. The second case is very similar (using "signature-exact") but it states that the full `dbOffset` -- including static text and ordering of dynamic attributes -- must be the same.

The final case, allows for keeping any Model which self-references itself to stay on the same dynamic paths but other Models will be allowed to modulate based on the `@mock()` settings applied to their dynamic segments.

#### Override Bahavior

The **Passthrough** feature mentioned above is less to do strictly with dynamic paths (although it clearly can effect it) and more to do with whether the "overrides" which are passed into the initial model should be passed along to the models which the primary model has a FK relationship with.

> Note, the importance of this is only relevant if you are using the `followRelationships()` option off of **Mock**

By default the answer is "no" but you can change this by simply invoking `.overridesPassThrough()`.

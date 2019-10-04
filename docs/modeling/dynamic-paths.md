# Dynamic Paths (modeling)

## Introducing Dynamic Offsets

The Firebase **Real Time Database** is great but it has certain limits and two in particular combine to limit the effectiveness of always having a set of records at the same path in the database. These limits are:

1. The **permissions model** can be limiting sometimes if ALL records are part of a single list
2. The **query capabilities** are limited to a *single* property in Firebase

The good news is that **Firemodel** makes moving away from these limitations relatively easy but it is a matter of tradeoffs and this section is focused on understanding these tradeoffs.

## Addressing Permissions Limitations

The permission/security model in **Firebase** provides you access to the following attributes for use in security rules:

- `$uid` - the ID of the user logged in (_for non-role based authorization this is a great tool to segment permissions on_)
- `$auth.token.[claim]` - checks for the existance of a [custom claim](https://firebase.google.com/docs/auth/admin/custom-claims) (_for role-based authorization situations_)
- `$children` - you can state that all _children_ of a given path should have a certain permission (_this is very useful to give permissions to individual records versus the list as a whole_)

With these variables along with normal boolean logic operators you can do a surprisingly large amount of things but one handicap shows up where you might want to get a _list_ of a `Model`. In order to have permission to _scan_ the list of records you must have full read access to all of the records. So that means if you wanted to do something like:

```typescript
const myStuff = List.where(Task, 'uid', uid)
```

This query would -- if allowed -- only return _tasks_ which are assigned to the current user but in order to be allowed to run this query you must have read access to not only your tasks but others. This is an easily missed distinction that you should consider early in your design.

In some cases this limitation is not easily addressed with _dynamic paths_ but a pretty common use-case is when you ["multi-tenancy"](https://en.wikipedia.org/wiki/Multitenancy) requirements or any situation in which certain user groups can see a GROUP of records of a given `Model` but not all of them. In these situations you could group the list into groups and give each group the full read rights to their group. Although the above might not be the best example in some ways, let's imagine that you did want to allow a user to see all their tasks via a `List` operator. If you grouped the tasks by the `uid` property the tasks would be naturally grouped in the database like so:

```typescript
{
  byUser: {
    "uid1": {
      tasks: {
        "taskId1": { ... task ... },
        "taskId2": { ... task ... },
        "taskId3": { ... task ... },
      }
    },
    "uid2": {
      tasks: {
        "taskId1": { ... task ... }
      }
    }
  },
}
```

You now can easily setup rules in the database that give each user access to their tasks as well as the parent "list node" while at the same denying users the ability to see other users' tasks. That has some nice benefits but the downside is that you no longer have single list of tasks but rather many lists of tasks. This might be awkward when you have an admin function or reporting function that wants to iterate over all user's tasks. Not that this isn't possible but there is more work involved.

## Addressing Query Limitations

Firebase's Real Time Database queries can only filter records on a single property. If you need to filter by more than one the traditional suggestion is to do this on the client side. To illustrate this, let's take a look at a piece of SQL that maybe people will relate to:

```sql
SELECT * from Products where geoCode = "12345" AND status != "archived";
```

This is a totally reasonable SQL query but in Firebase the `AND` clause is not an option. So does this matter? It turns out that in many cases it does not.

Typically in modern SPA's you want to bring a data type in large part into the client state management framework (e.g., Redux, Vuex, etc.) and then use GETTERs to reduce that state or shape it on the framework. In other cases, there is a genuine need to reduce the data coming back from the server but that can be done prior to mutating (*adding/updating*) it into the client's state management framework.

So in all the cases above you'll be fine working within Firebase's limitation but there are cases where you may consider moving outside it. Let's assume, for instance, that:

- you have a bunch of data entities that are all geographically constrainted to a particular area
  - Some of our data entities -- let's say `Product` and `Order` -- are geographically constrained to a given state
  - Both `Product` and `Order` have the potential to grow to a large number of records
  - These data entities both have `state` as a property hanging off their definitions
- at the same time, our data model has other data entities which are global in their geographic scope. Let's say `UserProfile` is an example

So what we _can_ do in Firebase is segment our data for the geographically separate content on a state-by-state data path. So following our example, if we had two products ... one from Connecticut and one from Massachusetts, we would see them placed in the database state tree like so:

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

## Modeling Dynamic Paths

In the above sections we have attempted to explain _why_ you might want to use dynamic paths, this section is about HOW we actually model these paths. If you've already modeled the dynamic paths and just want to _use_ them (aka, queries, watchers, etc) then check out the [dynamic paths](../using/dynamic-paths) section in the _Using_ section.

The good news is that modeling dynamic properties is super simple. Let's show two examples here:

```typescript
@model(dbOffset: 'state/:state' )
export default class Product extends Model {}
```

In the simple example above we are simply saying that the state which a product is associated with is an important grouping and that the products should be stored in the database like this:

```typescript
{
  state: {
    CT: {
      products: {
        ...
      }
    },
    MA: {
      products: {
        ...
      }
    }
  }
}
```

While there isn't much more to it then that, let's take one more example:

```typescript
@model(dbOffset: 'state/:state/:retailer' )
export default class Product extends Model {}
```

Here all we're doing is going further in our grouping strategy by stating that we want to group first by state and then within the state, group by the retailer (had we wanted the retailer to be considered first it would simply be a matter of reversing the order). Note, that while we added the static text "state" to the path we did not do the same for "retailer" but we could have; that is entirely left to your discretion.

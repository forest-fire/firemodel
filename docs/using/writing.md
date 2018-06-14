# Writing to Firebase

## Adding records

Adding new records in **FireModel** can be done with _both_ the `Record` and `List` classes. Let's start with the `Record` class:

```typescript
const newPerson = await Record.add(Person, {
  name: "Howdy Doody",
  age: 15
});
```

This is short and sweet and is likely the most common way of achieving the goal of adding a new record. Not only will this add the stated properties to Firebase but it will also add `lastUpdated` and `createdAt` properties as well as a Firebase created ID.


In a slightly modified example, imagine that you want to add a new `Company` "ABC Corp" and you've decided that rather that using Firebase's push() method -- which is what happened above -- to auto-create an ID you want to use slugified names for the company's ID. No problem, you can just include the ID property as part of the record like so:

```typescript
await Record.add(Company, { id: "abc-corp", name: "ABC Corp" });
```

However sometimes you may find yourself already working with a `List` in which case it may be better to do the following:

```typescript
const people = List.recent(People, 25);
/** do some stuff */
const newPerson: Record<Person> = await people.add({
  name: "Howdy Doody",
  age: 15  
})
```

> **Note:** all CRUD methods in **FireMock** are "contextual" and therefore there is no need to state the database path as this is already known

## Removing records

Removing records is also achievable through `Record` and `List`; and in fact there are two different ways to do it with `Record`. Let's start with the static initializer method:

```typescript
const deletedPerson = await Record.remove(Person, "1234");
```

This approach will first fetch the record from Firebase and add it to the `Record` class; it will then remove it from Firebase and return a record of what the value *had* been. Getting the record's old values at time of removal can be quite useful but there is a performance penalty so if you wish to just remove the record and _not_ get back the old value you can do this like so:

```typescript
await Record.remove(Person, "1234", false);
```


Alternatively there will be cases where you've already gotten an instantiated `Record` object and your business logic determines that it should be removed you would do the following:

```typescript
const person = await Record.get(Person, "1234");
/** do some things */
await person.remove();
```

Finally, in the case where you have a `List` of data, you can do the following:

```typescript
const people = await List.all(Person);
await people.remove("1234");
```

## Updating records

So after having covered "adding" and "removing" we'll now touch on the slightly more nuanced _updating_ of records. Why is updating more _nuanced_? Well updating is just kinda more complicated by it's very nature but Firebase adds its own little twist under the heading of "multi-path updates". 

In the Firebase SDK the `update()` operation is a non destructive operation. So for instance if you had a person in the database under the "1234" ID and then did this:

```typescript
await ref('authenticated/people/1234').update({ favoriteColor: "blue" });
```

It would add (or update) `favoriteColor` but not blow away the other properties like "name", "age", etc that also sit at the same path of `authenticated/people/1234`. This non-destructive behavior is useful but the SDK overloads the `update()` method with another very useful feature called "multi-path updates" which _are_ destructive. 

In **FireModel** we've separated these two operations from a nomenclature perspective and behind the scenes what we're really doing is doing a bunch of sneaky "multi-path updates" so that when things are written to the database they are writting _atomically_ (aka, all as part of one transaction). 

Let's start with a basic operation ... say you have a `Person` record and you want to change `favoriteColor` color like the example above but you also wanted to add another "child" to your `children` relationship. You would write something like:

```typescript
const jimmy = Record.get(Person, "1234");
jimmy.set('favoriteColor', "blue");
jimmy.addToRelationship('children', '4567');
await jimmy.update();
```

This would then know to update the following paths under the covers: 

```typescript
[
  "/authenticated/people/1234/favoriteColor": "blue",
  "/authenticated/people/1234/children/4567": true,
  "/authenticated/people/1234/lastUpdated": [now],
  "/authenticated/people/4567/parents/1234": true,
  "/authenticated/people/4567/lastUpdated": [now],
]
```

![](../images/mic-drop.jpg)

Hot damn! Let's get this party started. Next up ... _watching_ for change.

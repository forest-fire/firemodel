# Writing to Firebase

## Adding records

Adding new records in **Firemodel** can be done with _both_ the `Record` and `List` classes. Let's start with the `Record` class:

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
const people = await List.recent(People, 25);
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

In the Firebase SDK -- as well as `abstracted-admin` / `abstracted-client` -- the `update()` operation is "non destructive":

```typescript
await ref('people/1234').update({ favoriteColor: "blue" });
```

That same idea is carried forward to **Firemodel**. So, for instance, if were to execute:

```typescript
const person = await Record.get(Person, '1234');
person.update({ favoriteColor: 'blue' });
```

It would update `favoriteColor` (and `lastUpdated`) but not change  other properties like "name", "age", etc that also sit at the same path of `people/1234`.

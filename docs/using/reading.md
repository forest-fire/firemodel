# Reading

There are a few ways that you might _read_ data from the database but the two most common are read a singular record or to want a _list_ of records. Conveniently these goals can easily be achieved with the `Record` and `List` classes:

## The Record Class

Let's imagine a _schema_ which we've defined (see "modeling" section if you're already lost) to look like so:

```typescript
@schema({ dbOffset: "authenticated" })
export class Person extends BaseSchema {
  // prettier-ignore
  @property @length(20) public name: string;
  @property public age?: number;
  @property public gender?: "male" | "female" | "other";
}
```

Ok great, so what we've done with the schema is we've defined the data structure we expect and with the `@schema` decorator we've also stated that in the backed the database will store "people" off of the `authenticated` path.

So assuming you're already somewhat familiar with Firebase you might get a "person" with good old Firebase SDK:

```typescript
const joe = await db.ref("/authenticated/people/1234").once("value");
```

Assuming "joe" is indeed record ID "1234" -- and since this is documentation we are allowed to state with confidence that Joe is indeed 1234 -- this Firebase query will bring back Firebase object which we can use to get his age and record ID like so:

```typescript
const age = joe.val().age;
const id = joe.key();
```

This is kinda ok but I always found it a bit awkward. In comparison, here's how you'd do the same thing with **FireModel**:

```typescript
const joe = await Record.get(Person, "1234");
const { id, age } = joe.data;
```

A few things to note:

- keen observers may have noticed that to get the data of the record by working off the aptly named `data` property. True. Why? Well because the record class provides a compact API itself and we didn't want that to have collisions with your schema's API.
- in most JS/TS projects we're used to working with arrays-of-hashes data structures but Firebase kinda sucks at storing arrays so instead asks you to save this data as dictionary data structures:

  ```typescript
  const arrayOfHashes = [
    {
      id: "1234",
      name: "Joe",
      age: 20
    },
    {
      ...
    }
  ];
  const firebaseDictionaryStorage = {
    1234: {
      name: "Joe",
      age: 20
    },
    2345: {
      ...
    }
  };
  ```

  FireModel is not changing how data is stored in the database but instead is exposing it to you in a more familiar way with the `id` property sitting alongside the other properties of your schema/model.

- Since we have passed in the schema to `Record` it is now fully type-aware of all the properties and relationships that exist. And of course the Record API is also typed so you misspell anything it is geniunely your fault. :)

## List

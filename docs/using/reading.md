# Reading from Firebase

There are a few ways that you might _read_ data from the database but the two most common are read a singular record or to want a _list_ of records. Conveniently these goals can easily be achieved with the `Record` and `List` classes. 

In our examples we will be working with a `Person` _model_ which we've defined as (see ["modeling" section](../modeling/) if this is confusing):

```typescript
@model({ dbOffset: "authenticated" })
export class Person extends Model {
  // prettier-ignore
  @property public name: string;
  @property public age?: number;
  @property public gender?: "male" | "female" | "other";
}
```

Do note that the `@model` decorator states with `dboffset` that in the firebase database we will store "people" off of the `authenticated` path.

## Getting a Record

### The old fashioned way

So assuming you're already somewhat familiar with Firebase you might get a "person" with good old Firebase SDK like so:

```typescript
const joe = await db.ref("/authenticated/people/1234").once("value");
```

Assuming "joe" is indeed record ID "1234" -- and since this is documentation we are allowed to state with confidence that Joe is indeed 1234 -- this Firebase query will bring back a Firebase "snapshot" which we can use to get his age and record ID like so:

```typescript
const age = joe.val().age;
const id = joe.key();
```

### Using a `Record`

This is kinda ok but I always found it a bit awkward. In comparison, here's how you'd do the same thing with **Firemodel**:

```typescript
const joe = await Record.get(Person, "1234");
const { id, age } = joe.data;
```

A few things to note:

- to get the "data" of the record we must unbox the `data` property. Why? Well because the record class provides a compact API itself and we didn't want that to have collisions with your schema's API.
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

  Firemodel is not changing how data is stored in the database but instead is exposing it to you in a more familiar way with the `id` property sitting alongside the other properties of your schema/model.

- Since we have passed in the _model_ to `Record` it is now fully type-aware of all the properties and relationships that exist. And of course the Record API is also typed so if you miss-spell anything it is genuinely your fault. :)




## Getting a list of Records

Getting a list of records involves leveraging the `List` class and it's many static methods that help retrieve what you're after. Here's a simple example:

```typescript
const people = await List.recent(Person, 10);
```

This will retrieve the 10 most recently updated `Person` records in the database. Pretty neat right? So how might we interact with list of records? Here are some examples:

```typescript
// assuming Joe is in the most recent category
const joe = people.get("1234");
// if we're not sure Joe is that recent we can set a default value;
// if we don't an error will be thrown in cases where this ID is not in memory
const joe = people.get("1234", null);
// we can filter and map directly off the list
const children = people.filter(p => p.age < 18);
// if you just want to handle a bunch of straight up array of JS objects
const plainFolks: Person[] = people.data;
```

There's more but you can find it all with your favorite editor because the API is typed and descriptions are there too. Yes now you are living. Welcome to the top floor.

### Strategies for Populating Lists

In the above example we used the `List.recent()` static initializer but there are several others you can use as well:

- `where` - allows us to query on a single property with a comparison operator (_equality_ is default comparison operator):

  ```typescript
  const retirementAge = await List.where(Person, "age", 65);
  const retired = await List.where(Person, "age", [">", 65]);
  ```

- `all` - if you want to load ALL the records of a particular type you can do that:

  ```typescript
  const allPeople = await List.all(Person);
  ```

- `since` - often what you want to know is: which records have _changed_ or been _added_ since a given date/time:

  ```typescript
  // use any textual description which JS's Date() constructor will understand
  const needsAttention = await List.since(Person, "2018-07-18");
  // you can use miliseconds format too ( e.g., Date().getTime() )
  const needsAttention = await List.since(Person, 12393392349);
  ```

And last but certainly not least is the "do anything" initializer:

- `fromQuery` - if you want to go further with your queries you can build the query externally and pass it in:

  ```typescript
  const query = new SerializedQuery()
    .orderByKey('lastUpdated')
    .startAt(123542000)
    .endAt(15679000)
    .limitToFirst(10);
  const first10inJuly = await List.fromQuery(Person, query);
  ```

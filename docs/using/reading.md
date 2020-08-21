---
sidebarDepth: 3
---
# Reading from Firebase


There are a few ways that you might _read_ data from the database but the two most common are read a singular record or to want a _list_ of records. Conveniently these goals can easily be achieved with the `Record` and `List` classes.

In our examples we will be working with a `Person` _model_ which we've defined as:

```typescript
@model()
export class Person extends Model {
  @property public name: string;
  @property public age?: number;
  @property public gender?: "male" | "female" | "other";
}
```

## Getting a Record
### Basics

Getting a singular Record of a given Model is a breeze with Firemodel:

```typescript
const joe = await Record.get(Person, "1234");
```

This returns a _type_ of `Record<Person>` which is a little API surface for working with Record. This can be useful but in many cases you just want the cold, hard facts (well _data_ not _facts_):

```typescript
// get the Person data for record "1234"
const joe = (await Record.get(Person, "1234")).data;
```

### The Record API
The instance of a record provides a small set of functions such as `remove()`, `update()` and a few others. It also gives you access to key meta properties of the model and the particular record. This interface is fully typed and should be highly intuitive so we'll not cover any details in this section but it will be briefly discussed in other parts of the docs.

### The Options Hash
As is true in many other areas of the Firemodel API, the last parameter provides a dictionary/hash of options you can set. Nothing is required but these options help you fine tune what you want to do.

## Querying a `List` of records

Getting a list of records involves leveraging the `List` class. In general there are two primary ways to query:

1. Shorthands
2. Firebase Query

We'll start with the shorthand's in the next section.

### Query Shorthands

To get us started, here are a few examples of what shorthands look like:

```typescript
// Get the articles updated in the past day
const DAY = 24 * 60 * 1000
const articles = await List.since(Article, new Date().getTime() - DAY)
// Get the last 10 books added to the database
const books = await List.recent(Book, 10);
// Get all of the featured products
const featured = await List.all(FeaturedProduct)
```

This short-hand notation is very convenient and when including the optional _options_ hash as part of the signature, they should allow you to do almost everything you need.

All shorthands are fully typed with good documentation built into the types but below you will find an overview of those provided:

- `all` - if you want to load ALL the records of a particular type you can do that:

  ```typescript
  const allPeople = await List.all(Person);
  ```

- `where` - allows us to query on a single property with a comparison operator (_equality_ is the default comparison operator):

  ```typescript
  const retirementAge = await List.where(Person, "age", 65);
  const retired = await List.where(Person, "age", [">", 65]);
  ```

- `since` - provides all records which have been _updated_ since a given date/time; just provide a JS datetime stamp (aka, miliseconds since 1970) or a string value that JS's Date constructor will be able to understand:

  ```typescript
  const needsAttention = await List.since(Person, "2018-07-18");
  const needsAttention = await List.since(Person, 12393392349);
  ```

- `recent` - provides a discrete number of the most recently updated records of a given model:

  ```typescript
  // Gets the 10 most recently updated articles
  const mostRecent = await List.recent(Article, 10);
  ```

- `inactive` - provides the _least_ active records (aka, where `lastUpdated` hasn't been changed for the largest period of time):

  ```typescript
  // get the 10 least recently updated ideas
  const noOneCares = await List.inactive(Ideas, 10);
  ```

- `first` - provides the _first_ records of a given model which were added; using the `createdAt` property as a guide:

  ```typescript
  // get the first 10 members added to database
  const earlyBirds = await List.first(Members, 10);
  ```

- `last` - provides the _last_ records of a given model which were added; using the `createdAt` property as a guide:

  ```typescript
  // get the most recent 10 members added to database
  const justJoined = await List.first(Members, 10);
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

### Firebase Queries

If the shorthand queries don't fit your needs you are able build any query you'd like:

```ts
// Products priced between $5 to $10, with a max of 50 products returned
const fancyPants = List.query(Products, q => 
  q.orderByKey('price')
   .startAt(5)
   .endAt(10)
   .limitToFirst(50)
);
```

If this syntax looks familiar, it should as it's the Firebase **Real Time** database's query interface. But isn't it _also_ the query API for the **Firestore** database? Well not exactly ... let's discuss.

Firemodel doesn't care about which database you use but in reality **Firestore** is definitely a lot more grown up in what it can query for. Depending on what database connection you pass in using [`universal-fire`](https://universal-fire.net) you will be presented with the appropriate API surface but in the case of **Firestore** you'll get a _very_ mildly altered surface to make it more consistent with the **Real Time** DB's. This preserves greater portability and allows all RTDB queries to "just work" with **Firestore** without any adjustment.

To help illustrate this point:

- both DB's have a property called `limitToLast` but RTDB has `limitToFirst` and Firestore strangely decided to break protocol and use `limit`. 
- With Firemodel you'll ALWAYS be able to use `limitToFirst` in a bespoke query (and it will be translated to `limit`)
- Alternately if you're using Firebase and really like the new naming, you can use `limit` and that will work too.

In the above situation you can ensure cross DB compatibility by using the common names but there are some capabilities of the Firestore API that just aren't portable so keep this in mind if portability is important to you.

## Pagination

When using `List` queries you want to get the data you need but not more than you need. One very common strategy of reducing data transfers is to _paginate_ data. If you're using Firemodel's "shorthand" queries you can gain pagination quite easily:

```ts
// make the first request and get 25 results
const atFirst = await List.all(Albums, { pagination: 25 });
// make another request for 25
const andThen = await atFirst.next();
// check if we're done
if(andThen.done()) { ... }
```

> Note: if you don't initialize pagination option and then try to use `next()` or `done()` then  Firemodel will become very angry and throw an error. Don't anger Firemodel ... bad karma.

If you are using _bespoke_ queries then you can still get utility out of the pagination features by taking advantage of some additional properties which will be passed into the query function generator:

```ts
const aStepAtATime = await List.query(
    Artist, 
    (q, offset, pageSize) => 
       q.orderBy('popularity')
        .limitToFirst(pageSize)
        .startAt(offset),
    { paginate: 25 }
);
```

## Query Libraries

If you want to build a set of reusable query libraries for a particular Model, this is possible with the `createQueryLibrary` function. This can be a useful way to create reusable queries across your apps or across the front and backends.

A query library definition would look something like:

```ts
import { createQueryLibrary } from 'firemodel';

const library = createQueryLibrary(Artist)(q => {
  topArtists: (q, o, sz) => q.orderBy('popularity').limitToFirst(sz).startAt(o),
  countryArtists: (q) => q.where('genre', 'country')
});
```

With this simple setup you can now export and reuse these queries before a database connection has been established. Because you are doing it _before_ chosing a particular database it will -- by default -- lock you into the general syntax and querying capabilities which are shared across both **Firestore** and **Real Time DB** databases. If, however, you're convinced that this library should only be used on Firestore you can configure it in the options hash:

```ts
import { createQueryLibrary } from 'firemodel';
const library = createQueryLibrary(Artist)(q => { ... }, { db: 'firestore'});
```

> **Note:** you can also lock your library down to being just the Real Time Database but there is little reason to do this as the general syntax supports RTDB functionality entirely so you'd mainly just be opting out of portability.

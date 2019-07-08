# Review of Usage

### Primary API Surface

Before we move into the Advanced Topics section let's quickly review the primary tools we'll use while working with **Firemodel**:

1.  `Record` - gives us access and tools to work on a singular model
2.  `List` - let's us retrieve and work with lists of records (or a particular type)
3.  `Watch` - Gives us the ability to state our interests in Firebase and have it inform us of changes as they happen

### Database Access

All of the above classes need to be provided access to the database by leverage either the `abstraced-client` (firebase client sdk) or `abstracted-admin` (firebase admin sdk) client libraries. If -- like most projects -- you're only connecting to a single database you can set this once (see below) and you're done.

```typescript
import FireModel from "firemodel";
import { DB } from "abstracted-admin";
const db = await DB.connect(); // instantiates and then waits for DB connection
FireModel.defaultDb = db; // sets the default DB for Record, List, and Watch
```

If you _do_ need multiple databases you can always include the database connection as part of the `options` parameters of any of the classes accessor methods. For instance:

```typescript
const list = await List.all(Person, { db: mySpecialDb });
```

### Static Initializers

We've already demonstrated a lot of the ways you can initialize your `Record`, `List`, and `Watch` classes but here's a quick overview:

| RECORD           | LIST                        | WATCH                         |
| ---------------- | --------------------------- | ----------------------------- |
| `.get(m, id)`    |                             | `.record(m, id)`              |
| `.add(m, obj)`   | `.all(m)`                   | `.list(m).all()`              |
| `.remove(m, id)` | `.since(m, when)`           | `.list(m).since(when)`        |
|                  | `.dormantSince(m, howMany)` | `.list(m).dormantSince(when)` |
|                  | `.first(m, howMany)`        | `.list(m).first(howMany)`     |
|                  | `.last(m, howMany)`         | `.list(m).last(howMany)`      |
|                  | `.recent(m, howMany)`       | `.list(m).recent(howMany)`    |
|                  | `.inactive(m, howMany)`     | `.list(m).inactive(howMany)`  |
|                  | `.where(m, prop, val)`      | `.list(m).where(prop, val)`   |
|                  | `.fromQuery(m, query)`      | `.list(m).fromQuery(query)`   |

Where `m` is the **Model** that the above class is focused on. Also, each of the above has a trailing optional parameter called `options` which can be added (see the `db` example from above).

This list is more for seeing the API at 10,000ft than a detailed documenation as the API is fully typed so the documentation should show up as intellisense in your editor to help you explore the API surface while you're using it:



# Setting up Mocking

The mocking functionality exposed by **Firemodel** is via the `Mock` function. Let's just start with an example as hopefully a lot of it self-explanatory and super basic:

```typescript
import { Mock } from "firemodel";
import { DB } from "abstracted-admin";
import { Person } from "./models/Person";
const db = new DB({ mocking: true });

await Mock(Person, db)
  .generate(10)
  .generate(1, { age: 12 });
```

This will generate 11 person records, 10 of them fully _auto-mocked_, the last one also _auto_mocked_ but with the `age` property pegged at 12. Here's what it might look like in the mock database:

```typescript
{
  authenticated: {
    people: {
      "1234": {
        name: "Bob Marley",
        age: 56,
        gender: "male",
        lastUpdated:
      }
      /// ...
    }
  }
}
```

### Auto-Mocking

So why was the example so simple and devoid of configuration? Well it's two parts because of "context" that the model has and one part over simplification. Let's start with the _context_ that we're benefiting from:

- Because we know the "type" of each property at run time we can use that to produce a moderately meaningful random result using the FakerJS library.
- Certain property names denote context like `gender` ... instead of just being a random string it has been constrained to a random value of `[ "male", "female", "other" ]`
- Another example of this property-name context is the "name" field.

This means that a lot of properties, especially those with common names will do a remarkably good job of just "working" when you run the mock. The real world, sadly, is filled with exceptions and rough edges ... continue to the next section to see how you can extend the auto-mocking functionality when that's needed.

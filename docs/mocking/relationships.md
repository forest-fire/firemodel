---
next: false 
---

# Mocking Relationships

Up to now our examples have stayed focused on model properties but clearly you will have relationships in most/many of your models and these two need modeling. Let's explore the following model:

```typescript
@model(dbOffset: 'authenticated')
export class Person extends Model {
  @property name: string;
  @hasMany children?: fk[];
  @belongsTo(Company) employer: fk;
}
```

> **note:** we know that due to the _opininated_ nature of Firemodel the "id" properties must be strings. The `fk` type is just an alias for "string" but convey's more context

So what will this model look like when we mock it? The answer is:

```typescript
{
  authenticated: {
    people: {
      "1234": {
        name: "Rocky Raccoon",
        children: [],
        employer: ""
      }
    }
  }
}
```

Well that kinda sucks. Right data structure (aka, an array to hold a "hasMany" and an empty string to hold a "belongsTo") but nothing else.

Well we can do better, but doing so comes as part of the `Mock` function. Let's explore an explicit call to `Mock`:

```typescript
// Scenario A
await Mock(Person, db)
  .createRelationshipLinks()
  .generate(10);

// Scneario B
await Mock(Person, db)
  .followRelationshipLinks()
  .generate(10);
```

In both scenarios we create 10 `Person` records in the mock database and in both cases our relationships have FK id's attached (2 per a "hasMany", obviously just one for a "belongsTo"); but in "Scenario B" we go a step further and actually create records in the Mock DB for the FK links as well.

If that's not enough control for you, maybe you should book yourself a therapist appointment as you're likely suffering from a control-related maledy. If you're too busy for that appointment at the moment, there is a bit of temporary relief we can provide ... the `createRelationshipLinks()` and `followRelationshipLinks()` methods will accept an optional configuration example. Let's look at an example:

```typescript
// Scenario A
Mock(Person, db)
  .followRelationshipLinks()
  .generate(5)
  .followRelationshipLinks({ cars: [1, 3], company: true })
  .generate(5);
```

With this configuration you see two new things:

1. You can stack configurations. The first 5 people will just use the default config, the next 5 our custom configuration.
2. The configuration allows us to state each relationships you want to be populated and then you state `true` value if you want the default behavior for that relationship or in the case of a `hasMany` you can state a number (for cardinality) or as we see in this example you can introduce some optionality in the cardinality.

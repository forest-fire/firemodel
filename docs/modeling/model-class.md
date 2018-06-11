# The Model Class

So back to the term "model". In Firemodel, a _model_ refers to the `Model` class and it's function al role is to wrap a `Schema` class to provide a basic API surface. Here's an example of how you might do this for the `Person` schema:

```typescript
const People = Model.create(Person);
```

Now with the `People` model we can do things like "get", "set", "update" records:

```typescript
const joe: Record<Person> = People.get("1234");
await joe.update({ name: "joseph" });
```

In the development of this library, however, I started to realize that this kind of wrapping API would really be better served by two masters: a `Record` and a `List` which are now the primary means of _using_ your schemas. For this reason, the **Model** still exists but I may deprecate it at some future point and just use `Record` and `List`. The newer syntax would looks like:

```typescript
const joe: Record.get(Person, "1234");
const people: List.all(Person);
const daYouth: List.where(Person, "age", ["<", 10]);
```

Ugh. Naming is hard.

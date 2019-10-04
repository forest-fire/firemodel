# Our First Model

Let's start simple but let's jump into an example immediately:

```typescript
@model()
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
}
```

You can probably look at this and understand most of it, but here's a quick point-by-point analysis:

1. **@model** - By stating that this class is a `@model` we are in effect activating for use throughout **Firemodel**
2. **Model class** - We extend the `Model` class ... more on that later but in essence we get a few opinionated properties for free.
3. **Typing** - Each of the properties in our model are typed using standard TypeScript nomenclature
4. **@property** - By using the `@property` decorator we are capturing the type information about the property for the run-time environment.

With this model in place, we could now use it like this to get the 10 most recently added people to the database:

```typescript
const people = await List.recent(Person, 10);
```

More on the `List`,  `Record`, and `Watch` classes in the "Using" section. Here we just want to get a full understanding of how to model data. On the next page we will continue learning through example but before we move on let's explore what we already have:

- A strongly typed model language that leverages the massively popular TypeScript grammar
- Typing information that your editor can use to guide you as you code but _also_ type information provided to your code at run time, and an explicit data contract with Firebase

I was searching for a third bullet point but hopefully you're impressed with the two we have. Let's move onto another example.

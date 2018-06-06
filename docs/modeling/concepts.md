# Concepts

Modeling is the act of describing the data structures/entities in your application or architecture. The term "model" is familiar to many and this is _useful_ as well as _detrimental_ in understanding what a `Model` is in **FireModel**.

Ok Mr. Fansy Pants, so what is a Model then? Good question but let's first bring in related word first ... "schema". Many would see these two terms overlaping and that's good as they fit into the same ecosystem for sure. In the case of **FireModel** it's probably best to start with Schema. So if I may have your permission ...

## Schemas

Schemas are the _things_ which we use to define the structure of entities. So imagine we have a **Person** who we want to represent in our application, we might define a schema as:

```typescript
@schema()
export class Person extends BaseSchema {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
}
```

This rather simple example leverages TypeScript's type system to define a structure for defining what we expect from a person. For those familiar with TypeScript you know how useful static types can be in your editor in revealing mistakes before they ever get into the wild. It's for this reason that TypeScript is breaking many records in accumulating fans as well as Github stars.

So now that we've completed that victory lap for TypeScript you might come back to ... so what is this doing for me _beyond_ what TypeScript brings? A good question. You truely are sharp. Take a moment and pat yourself on the back.

Ok so onto your question. The answer starts to take form when you realize that the _typing_ that is available to your editor and the Typescript transpiler at _compile time_ is preserved into _run time_ as well. This is done via the emerging standard -- and Typescript supported -- "decorators" and more importantly "emit decorator metadata". I will not go into the details of what these are as google will help you slueth these topics out but it's important to note that your `tsconfig.json` file will need to include the following:

```json
{
  /** ... */
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

Ok, back to the WHY. So WHY does having your typing available at compile and run-time add value? Well for one, both are states/conditions you as a developer will find yourself in and in which having access to type information could/should be available. But that's not the important reason ... being able to capture a schema, using a standardized syntax like TypeScript but preserving it to inform and constrain not only your frontend view layers but also the backend, any microservices you have hanging around, even the database. That's a bigger deal. Writing down your data structure once is fine but having to do it over and over again at various points in the architecture is not only boring boilerplate but also friction to change and operational risk.

In a nutshell, the goal here is to leverage TypeScript semantics to create a single definition of a schema and use it everywhere. Famous last words ... but that is the goal.

## Models

So back to the term "model". In Firemodel, the _model_ contains a [singular] _schema_ to provide a useable public API for that schema. Continuing our example of a Person from above ... there is not a "Person Model" but rather a single `Model` class which is instantiated to consume the "Person Schema" as input to create a useful API surface for that schema. In code this would look like:

```typescript
const People: Model<Person> = Model.create(Person);
```

Our goal here is to give you an understanding of the _relationship_ between **schemas** and **models** rather than go into depth into models here. Because models provide an API used largely to interact with state (in your database or your potentially a front-end state management library), it is better that the majority of focus for that API be covered in the "access" section of this documentation. That said, being completely abstract is a bullshit way of explaining things so here are a few examples of using the API that might help contextualize:

```typescript
const joe: Record<Person> = People.get("1234");
await joe.update({ name: "joseph" });
const daYouth: List<Person> = People.where("age", ["<", 10]);
```

## BaseSchema

Some of you eagle eyes may have noticed in our example schema we _extended_ the `BaseSchema` definition. This definition is very basic but provides a mild amount of "opinion" which helps to create more "out of the box" functionality.

# What are Schemas?

Schemas are the _things_ which we use to define the structure of entities. So imagine we have a **Person** who we want to represent in our application, we might define a schema as:

```typescript
@model()
export class Person extends BaseSchema {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
}
```

This rather simple example leverages TypeScript's type system to define a structure for defining what we expect from a person. For those familiar with TypeScript you know how useful static types can be in your editor in revealing mistakes before they ever get into the wild. It's for this reason that TypeScript is breaking many records in accumulating fans as well as Github stars.

So now that we've completed that victory lap for TypeScript you might come back to ... so what is this doing for me _beyond_ what TypeScript brings? A good question. You truely are sharp. Take a moment and pat yourself on the back.

Ok so onto your question. The answer starts to take form when you realize that the _typing_ that is available to your editor and the Typescript transpiler at _compile time_ is preserved into _run time_ as well. This is done via the emerging standard -- and Typescript supported -- "decorators" and more importantly "emit decorator metadata". I will not go into the details of what these are as google will help you slueth these topics out but it's important to note that your `tsconfig.json` file will need to include the following:

Ok, back to the WHY. So WHY does having your typing available at compile and run-time add value? Well for one, both are states/conditions you as a developer will find yourself in and in which having access to type information could/should be available. But that's not the important reason ... being able to capture a schema, using a standardized syntax like TypeScript but preserving it to inform and constrain not only your frontend view layers but also the backend, any microservices you have hanging around, even the database. That's a bigger deal. Writing down your data structure once is fine but having to do it over and over again at various points in the architecture is not only boring boilerplate but also friction to change and operational risk.

In a nutshell, the goal here is to leverage TypeScript semantics to create a single definition of a schema and use it everywhere. Famous last words ... but that is the goal.

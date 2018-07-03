# Model Constraints

Our first example was pretty basic and in our second one we're only going to add a bit but they are important changes to grok:

```typescript
@model(
  dbOffset: 'authenticated', 
  localOffset: 'in.the.tree', 
  localById: true,
  plural: 'peeps', 
  audit: true)
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
}
```

Maybe not surprisingly the "model constaints" are meta properties about your model as a whole (versus on a specific property). Let's review these options:

1. `dbOffset` - this tells **FireModel** that all Person records should saved to the database off of the "authenticated" data path.
2. `localOffset` - similar to _dbOffset_, this property allows you to offset where in your state management tree you're going to store these Records. 
3. `localPostfix` - it is often the case that in a **Vuex** or **Redux** state tree you want to have multiple representations of a list, or maybe a list with some meta-data alongside it. Here's a reasonable example:

    ```typescript
    const stateTree: IState = {
      users: {
        all: Users[];
        /** a lookup for the "all" list */
        byId: IDictionary<fk>;
        /** no backend representation, just a useful slice of data for UI */
        filtered: Users[];
        /** what it says on the tin */
        currentUser: User;
      }
    }
    ```

    We don't want to be overly prescriptive ... the structure is whatever you like. However, when you're modeling a _list_ of records, it is often that a "post-fix" offset makes sense. By default **FireModel** will use `all` as a default but you can set it to whatever you like including nothing at all (aka, an empty string).

4. `localById` - this is a boolean flag (which defaults to `false`); when set to `true` the frontend state management's reducers will add a `byId` property to each model which allows for quick lookups of individual records._
5. `plural` - by default **FireModel** will pluralize your model name using standard rules. It should get it right most of the time but if you want to override this you can here. The reason the plural name is brought up is that the plural name is used in the storage path for both Firebase and your frontend state management.
6. `audit` - in cases where the given model hold very sensitive data you may want to opt-in to having all changes _audited_. For more on this see the [Auditing subsection](../using/auditing.html) in the Using section.

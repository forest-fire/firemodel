# Relationships

Up to know our model's have just consisted of "properties" but not relationships to other models. If you like you can just and a foreign-key reference into your model as a property:

```typescript
@model()
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
  @property public employer?: fk;
}
```

As you can see here we've added the `employer` field and given it a type of "fk" (aka, foreign key). This type ships as an export to this library and it is nothing more than an alias to `string` but in general using `fk` is preferred as it is more descriptive.

### Built-in Support for Relationships

While the manual way of doing things is straight forward you'll be missing out on some of the functionality provided by **FireModel** through it's support for two types of relationships:

1. `ownedBy` - a 1:M relationship
2. `hasMany` - a M:1 or M:M relationship

So with this in mind, here's how you might model `Person`:

```typescript
@model()
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
  @belongsTo(() => Company) public employer?: fk;
  @hasMany(() => Person, 'parents') public children?: fk[];
  @hasMany(() => Person, 'children') public parents?: fk[];
}
```

Let's decompose what this example is illustrating:

1. `@belongsTo()` and `@hasmany()` establish their repective types of relationships while also associating the foreign model that is being linked to (even though that "foreign" model could be a self reference; as it is for `parents` and `children`)
2. We have optionally decided to add the `@inverse()` decorator to show that the relationship is linked bi-directionally. You don't need to do this but -- for instance -- by adding `@inverse()` to the `children` relationship, if you add a child FK to a person, then that child will automatically get a FK reference back to the parent on the `parents` property.

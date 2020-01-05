# Relationships

Up to now our model's have just consisted of "properties" but not relationships to other models. If you like you can just insert a foreign-key reference into your model as a property:

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

## Relationship Definitions

While the manual way of doing things is straightforward you'll be missing out on some of the functionality provided by **Firemodel** through it's support for two types of relationships:

1. `hasOne` - a 1:M relationship
2. `hasMany` - a M:1 or M:M relationship

So with this in mind, here's how you might model `Person`:

```typescript
@model()
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
  @hasOne(Company) public employer?: fk;
  @hasMany(Person, 'parents') public children?: fk[];
  @hasMany(Person, 'children') public parents?: fk[];
}
```

Let's decompose what this example is illustrating:

1. `@hasOne()` and `@hasmany()` establish their respective types of relationships while also associating the foreign model that is being linked to (even though that "foreign" model could be a self reference; as it is for `parents` and `children`)
2. Both relationship types can take an _optional_ second parameter which states the "inverse" (aka, the property name on the other end of the foreign key)

> **Note:** if you prefer you can use the `belongsTo` or `ownedBy` syntax instead of `hasOne`.

## The Inverse Property

The optional _inverse_ property allows you to express "two way" relationships. This is a powerful feature and most likely something you **do** want to use when you express a relationship.

Let's use a simple example. Below you'll find two models who relate to each other but since neither uses the inverse property they are assumed to be "one way" relationships:

```typescript
@model()
export class Patient extends Model {
  @property name: string;
  @hasOne(Doctor) doctor: fk;
}

@model()
export class Doctor extends Model {
  @property name: string;
  @hasMany(Patient) patients: fks;
}
```

That means that if you add a new patient to the `Doctor` model it _will_ add a FK to the Doctor model but the `Patient` record will **not** be updated to reference the `Doctor`. This is probably _not_ what you want. Here, in comparison is the same example but _with_ the inverse property:

```typescript
@model()
export class Patient extends Model {
  @property name: string;
  @hasOne(Doctor, 'patients') doctor: fk;
}

@model()
export class Doctor extends Model {
  @property name: string;
  @hasMany(Patient, 'doctor') patients: fks;
}
```

Now whenever the `Patient` or `Doctor` records are updated (in relation to one another, both will be updated.

There are sometimes situations where two-way synchronization is either very hard or impossible. Let's take the following `Person` model:

```typescript
@model({ dbOffset: "authenticated" })
export class Person extends Model {
  @property @length(20) public name: string;
  @property public gender?: "male" | "female" | "other";
  @belongsTo(Person, "children") public mother?: fk;
  @belongsTo(Person, "children") public father?: fk;
  @hasMany(Person) public children?: fks;
}
```

In the above model you will run into problems because both `mother` and `father` have an _inverse_ of `children`. This means that when a new child is added, Firemodel will not know whether that child's record should add the inverse key to `mother` or `father`. The system is _lossy_ and so there is no way to automatically manage this.

One option to address the above scenario is to manually manage this (aka, no inverse properties). Another might be to change the structure of the model to avoid the lossy conditions. There is one final way to manage this which should be done with some caution:

```typescript{7,8}
import { OneWay } from 'firemodel';

@model({ dbOffset: "authenticated" })
export class Person extends Model {
  @property @length(20) public name: string;
  @property public gender?: "male" | "female" | "other";
  @belongsTo(Person, OneWay("children")) public mother?: fk;
  @belongsTo(Person, OneWay("children")) public father?: fk;
  @hasMany(Person) public children?: fks;
}
```

Above you can see the use of the `OneWay` modifier. This will allow for any updates to the `mother` and `father` Fk's to automatically synchronize with the `children` properties of the foreign model but NOT synchronize in the other direction where the relationship is lossy. This "halfway" step is in many cases a bad compromise but it is available if you can put it to good use.

## Avoiding Circular Dependencies

When you use decorators (as we do here in **Firemodel**) the decorators are run _immediately_ when the classes are evaluated. This is often just fine -- in fact it is what you want -- but there is an age-old computer problem you can sometimes run into when dealing with relationships ... circular dependencies.

When you evaluate one model which relates to another, which relates to another, you can sometimes find yourself in a situation where the model passed in as parameter to the relationship decorator can not be evaluated due to cirucular dependency. To provide a way around this problem you can add a _string_ representation of the model instead of the constructor as a first parameter.

Below you'll see an example of the _default_ syntax next to the alternative:

```typescript
import { Company } from './models';

@model()
export class Person extends Model {
  @property name: string;

  // default means of declaring the relationship
  @hasOne(Company) currentEmployer: fk;
  // alternative means of declaring the relationship
  @hasMany('Company') priorEmployers: fks;
}
```

This example is meant to highlight the syntacitic differences but in reality you wouldn't use both syntaxes for the same model. In general it's probably best to use the primary/default means and then when/if you run into circular deps you can just switch to this secondary style where needed. Do remember, that when you use the _string_ based syntax that you no longer need the **import** statement and in fact should make sure you remove it as it's presence can contribute to the circular dependency problem.

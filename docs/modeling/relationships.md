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

## Relationship Definitions

While the manual way of doing things is straight forward you'll be missing out on some of the functionality provided by **FireModel** through it's support for two types of relationships:

1. `hasOne` - a 1:M relationship
2. `hasMany` - a M:1 or M:M relationship

So with this in mind, here's how you might model `Person`:

```typescript
@model()
export class Person extends Model {
  @property public name: string;
  @property public age: number;
  @property public gender?: "male" | "female" | "other";
  @hasOne(() => Company) public employer?: fk;
  @hasMany(() => Person, 'parents') public children?: fk[];
  @hasMany(() => Person, 'children') public parents?: fk[];
}
```

Let's decompose what this example is illustrating:

1. `@hasOne()` and `@hasmany()` establish their repective types of relationships while also associating the foreign model that is being linked to (even though that "foreign" model could be a self reference; as it is for `parents` and `children`)
2. Both relationship types can take an _optional_ second parameter which states the "inverse" (aka, the property name on the other end of the foreign key)

> **Note:** if you prefer you can use the `belongsTo` or `ownedBy` syntax instead of `hasOne`.

## The Inverse Property

The optional _inverse_ property is important so it's important to understand what's really happening with the use of it. To do this, we'll explore three examples: 1:M, M:1, and M:M. Before we go into each example though we should understand the "implicit" and "explicit" use-cases.

Above when we stated that you can state the "inverse" as part of the `@hasOne` or `@hasMany` decorator's signature this represents an **explicit** statement about what the inverse is intended to be. It is important to note, however, that if you are relating two Models and the inverse can be determined automatically the association will be made. Here is an example of where this would happen:

```typescript
@model()
export class Patient extends Model {
  @property name: string;
  @hasOne(() => Doctor) doctor: fk;
}

@model()
export class Doctor extends Model {
  @property name: string;
  @hasMany(() => Patient) patients: FirebaseFks;
}
```

Because these models are following an obvious naming convention, `Patient` and `Doctor` relationships are linked automatically. You can see this by introspecting a record's META property:

```typescript
const patient = Record.create(Patient);
expect(patient.META.relationship("doctor").inverseProperty).to.equal("patients");
expect(patient.META.relationship("doctor").inverseCardinality).to.equal("many");
```

If, in contrast, if we were relating a `Person` model and the `Doctor` model above it would not know that the `Person.doctor` relationship is connected to the `Doctor.patients` relationship. To ensure that **FireModel** is updating both sides of the relationship then you would need to explicitly define both:

```typescript
@model()
export class Patient extends Model {
  @property name: string;
  @hasOne(() => Doctor, "patients") doctor: IFmHasOne;
}

@model()
export class Doctor extends Model {
  @property name: string;
  @hasMany(() => Patient, "doctor") patients: IFmHasMany;
}
```

### One to Many ( `1:M` )

Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis at ab recusandae fugiat, saepe molestiae doloribus assumenda rem voluptates non illum nemo dolorem architecto animi obcaecati esse eius et iure

### Many to One ( `M:1` )

Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis at ab recusandae fugiat, saepe molestiae doloribus assumenda rem voluptates non illum nemo dolorem architecto animi obcaecati esse eius et iure

### Many to Many ( `M:M` )

Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis at ab recusandae fugiat, saepe molestiae doloribus assumenda rem voluptates non illum nemo dolorem architecto animi obcaecati esse eius et iure

## Relationship Constraints

Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis at ab recusandae fugiat, saepe molestiae doloribus assumenda rem voluptates non illum nemo dolorem architecto animi obcaecati esse eius et iure

# The "Model" Class

**Firemodel** is an opinionated framework and part of it's opinion is that it expects all of your models to _extend_ the `Model` class. What does that do? It's actually rather simple, this class has NO implementation but rather just provides a few data properties for your models:

```typescript
export abstract class Model {
  /** The primary-key for the record */
  @property public id?: string;
  /** The last time that a given record was updated */
  @property public lastUpdated?: epoch;
  /** The datetime at which this record was first created */
  @property public createdAt?: epoch;
  /** Metadata properties of the given schema */
  public META?: Partial<ISchemaOptions>;
}
```

where ISchemaOptions is:

```typescript
export interface ISchemaOptions<T extends Model = any> {
  /** Optionally specify a root path to store this schema under */
  dbOffset?: string;
  /** Optionally specify a root path where the local store will put this schema */
  localPrefix?: string;
  property?: (prop: keyof T) => ISchemaMetaProperties<T>;
  audit?: boolean;
  /** A list of all properties and associated meta-data for the given schema */
  properties?: Array<ISchemaMetaProperties<T>>;
  /** A list of all relationships and associated meta-data for the given schema */
  relationships?: Array<ISchemaRelationshipMetaProperties<T>>;
  /** A list of properties which should be pushed using firebase push() */
  pushKeys?: string[];
}
```

The `id`, `lastUpdated`, and `createdAt` properties need no introduction as they're very commonly found in apps and frameworks so we'll assume you "get it".

The last one is a bit odd that it's all CAPS but that's with the aim of not interfering with any namespace you'd want to use for your models. This property is where all the meta-information about the property is stored for run-time access. This includes the _type_ but also any constraints that were set on the property as well.

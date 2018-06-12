## FireModel Schemas

**FireModel** is an opinionated framework and part of it's opinion is it includes two Schemas out of the box. One it _expects_ you to use the other is used if you want to leverage the "audit" functionality of the framework.

### BaseSchema

The `BaseSchema` -- which some of you may have seen referenced in the example above -- is a minimalist assumption about the properties that ALL models should have.

```typescript
export abstract class BaseSchema {
  /** The primary-key for the record */
  @property public id?: string;
  /** The last time that a given record was updated */
  @property public lastUpdated?: epoch;
  /** The datetime at which this record was first created */
  @property public createdAt?: epoch;
  /** Metadata properties of the given schema */
  public META?: Partial<ISchemaOptions>;

  public toString() {
    const obj: IDictionary = {};
    this.META.properties.map(p => {
      obj[p.property] = (this as any)[p.property];
    });
    return JSON.stringify(obj);
  }
}
```

Hopefully the comments above give you enough of an understanding of what each property is for.

### AuditRecord

Auditing the framework will be covered later but suffice to say they are a way you opt into to monitor changes (aka, auditing change)

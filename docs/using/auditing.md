# Auditing

## Introduction

When you perform CRUD operations on a DB over time there is information loss. The most obvious is when a record is _removed_ but _updates_ are also a source. If a `Person`'s favorite color is "blue", there's no way to know that yesterday it was "green".

Whether this time-loss is important or not depends on the kind of information captured so in **FireModel** we allow you to state which of your Model's are to be "audited" for change:

```typescript
@schema({ audit: true })
export class Company extends BaseSchema {
  @property public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
```

In this example by setting auditing _on_ any modifications to the Model will be tracked in Firebase. By default this path in your database will be `/auditing` but you can replace the "true" value with a differnt path if you prefer.

### Accessing the Audit Log

Getting information out of the audit log is typically done via the `Record` or `List` classes. With a `Record` you would get the changes for just the record you have loaded, with a `List` it would be all changes which you have in your list (ordered by last updated).

```typescript
// Record
const joe = Record.get(Person, "1234");
const auditLog = await joe.getAuditLog();
// List
const people = List.all(Person);
const auditLog = await people.getAuditLog();
```

The audit log is modelled as `AuditLogItem[]`, where:

```typescript
export class AuditLogItem extends Model {
  id: string;
  timestamp: epochWithMiliseconds;
  /** the record-level operation */
  action: AuditOperations;
  /** the changes to properties, typically not represented in a "removed" op */
  changes: IAuditChange[];
}

export interface IAuditChange {
  /** the property name which changed */
  property: string;
  /** the property level operation */
  action: AuditOperations;
  before: any;
  after: any;
}

export type AuditOperations = "added" | "updated" | "removed";
```

## Advanced operations

TBD

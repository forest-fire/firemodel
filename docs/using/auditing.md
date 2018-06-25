# Auditing

## Introduction

When you perform CRUD operations on a DB over time there is information loss. The most obvious is when a record is _removed_ but _updates_ are also a source. If a `Person`'s favorite color is "blue", there's no way to know that yesterday it was "green".

Whether this time-loss is important or not depends on the kind of information captured so in **FireModel** we allow you to state which of your Model's are to be "audited" for change:

```typescript
@model({ audit: true })
export class Person extends Model {
  @property public name: string;
  @property public favoriteColor?: string;
}
```

In the example above we have instructued auditing to be turned on for the `Person` model; any modifications to the Model will be tracked in Firebase. 

## Auditing API surface

Let's work off of our `Person` from above and assume that we want to know the last 20 actions that have taken place on People on the system:

```typescript
import { auditLog } from "FireModel";
const log = await auditLog(Person).last(20);
```

and if I wanted the _next_ 20?

```typescript
const log = await auditLog(Person).last(20, 20);
```

Ok so that's the basic pattern but you can similar inspection patterns to what you've already seen in `List` and `Watch`:

```typescript
// Global paging searches
const log = await auditLog(Person).last(howMany, offset);
const log = await auditLog(Person).first(howMany, offset);
// Specialized paging searches
const log = await auditLog(Person).byRecordId("-lcad87234").first(howMany, offset);
const log = await auditLog(Person).action("removed").first(howMany, offset);
// Time Filter searches
const log = await auditLog(Person).since("2017-12-12");
const log = await auditLog(Person).before("2017-12-25");
const log = await auditLog(Person).between("2017-12-12", "2017-12-25");
```
 

## Convenience Functions

While you've seen the direct API for accessing the audit logs there are also convenience methods hanging off of `Record` and `List`:

```typescript
const joe = Record.get(Person, "1234");
// equivalent to auditLog(Person).byRecordId("1234").first(10)
const auditLog = await joe.getAuditLog().first(10);  

const people = List.all(Person);
// equivalent to auditLog(Person).between("2017-12-12", "2017-12-25")
const auditLog = await people.getAuditLog().between("2017-12-12", "2017-12-25");
```



## Details

The audit logs which are being stored are kept in your database at the root path of `auditing` and then broken down by model type:


```typescript
{
  auditing: {
    [ MODEL ]: {
      [ PUSHKEY ]: IAuditLogItem
    }
  }
}
```

where `IAuditLogItem` is:


```typescript
export interface IAuditLogItem {
  id: string;
  recordId: string;
  timestamp: epochWithMilliseconds;
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

If you really need to change the root path for you audit logs you can by stating an alternative path by:

```typescript
Firemodel.auditLogs = '/alternative/path'
```


## Limitations

Bear in mind that while **FireModel** takes care of writing out the audit logs for you with the simple configuration mentioned above it does depend on your applicaiton to always use **FireModel** for your write operations. If you're wanting to protect against rouge clients then this solution will not be complete enough for you. 

In this case it would make sense to look into writing a [Firebase Database Trigger](https://firebase.google.com/docs/functions/database-events) which will monitor all writes to your models endpoints. So long as this function writes audit logs in the same format as **FireModel**, you can preserve the audit logging read operations by configuring models with the `server` value as demonstrated below:

```typescript
@model({audit: 'server'})
export class Person extends Model { ... }
```

# Permissions and Indexes

> NOTE: THIS IS A WORK IN PROGRESS; DO NOT EXPECT THIS TO WORK YET

In addition to data-structure we can also annotate the permission level data should have which  in turn can be translated into Firebase security rules. Further, we have the ability at the property level to indicate which fields should be indexed.

### Permissions

All permissions are configured on a class/model level and consist of the following permission levels:

| READ          | WRITE         | CREATE        |
| ------------- | ------------- | ------------- |
| `public`      | `public`      | `public`      |
| `anon`        | `anon`        | `anon`        |
| `auth`        | `auth`        | `auth`        |
| `admin`       | `admin`       | `admin`       |
| `owner, prop` | `owner, prop` | `owner, prop` |
| `none`        | `none`        | `none`        |

 So let's say that you'd like the `User` records to be readable by all but writable only by the owner of that record, you would state something like the following:

```typescript
@model({ read: "auth", write: ["owner" , "uid"], create: "none" })
export class User extends Model {
  @property public uid: string;
  // ...
}
```

### Indexes

You may use any of the following annotations on the property level:

- `@index` - indexes the property in Firebase
- `@uniqueIndex` - same as `@index` *wrt* Firebase but for other schema exports (see GraphQL and Dexie) -- where distinction are made between unique and non-unique indexes -- this can be used to annotate this distinction

```typescript
@model({ read: "auth", write: "owner:uid", create: "none" })
export class User extends Model {
  @property @uniqueIndex public uid: string;
  @property @index public age: number;
  // ...
}
```

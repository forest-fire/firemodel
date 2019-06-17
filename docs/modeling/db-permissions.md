---
sidebarDepth: 3
---
# Database Permissions

> NOTE: THIS IS A WORK IN PROGRESS; DO NOT EXPECT THIS TO WORK YET

In addition to data-structure we can also annotate the permission level data should have which in turn can be translated into Firebase security rules. Further, we have the ability at the property level to indicate which fields should be indexed.

## Granting Permission

Setting up permissions for model is relatively easy due to the utility provided by the `Permissions` class which **Firemodel** exports. If we imagine a use-case where a `Employee` model has been defined as so:

```ts

@model({ dbOffset: 'territory/:territory' })
export class Employee extends Model {
  @property territory: string;
  @property name: string;
  @property age: number;
}
```

As we can see in the model definition, the "territory" is setup as a "dynamic path" and since all security rules are applied to a DB path this does provide some additional complexity. However, because of the `Permissions` class we can relatively easily address this wrinkle and several others. Let's imagine the following requirement:

- all employees get a Firebase "custom claim" for the territory that they work in. So if there is a terrority "abcd", then an employee who is employed in that territory will get a custom claim of `abcd`.
- For most employees, they will only be able to see their own employee record (to which they'll have both read and write access) but some employee's in a territory are considered "managers" and these users should be able to "read" all Employee profiles but only write to their own. In order to distinguish these managers, a manager will be given a custom claim of `manager`. While managers can see all employees they can _only_ see all employees in their territory.
- Finally let's assume that there is a uber role called `admin` and that these admin users can read and write all user profiles across all territories.

The rules to set this up would be:

```ts
const permissions = new Permissions()
  .grant("read", "write").toOwner('uid').withClaim(':territory')
  .grant("read").withClaim(':territory').withClaim('manager')
  .grant("read", "write").withClaim('admin')
```

As you can see this class uses the _fluent_ API style and allows the creation of one or more **grants** (with "read", "write", or both permissions). Each **grant** can then be qualified with:

- zero or more "custom claims" (`withClaim`) that must be present to allow for the permission grant to take place
- optionally you may state that a grant applies only to those records which are "owned" by the current user (`toOwner`)
- optionally you can also state that a grant is only for users who are "authenticated" (`whereAuthenticated`); the above example did not illustrate this

We will cover each of these options in greater detail in a moment but before we do let's introduce one other simple example which shows the "authenticated". Let's assume in our app we have "products" which can be read by everyone who has logged in, this would be a simple matter of:

```ts
const permissions = new Permissions()
  .grant("read").whereAuthenticated("known");
```

In the above example, we chose "known" users. This means that only users who are logged in _non_-anonymously will be allowed to read. Had we left off the parameter "known" it would have allowed *any* user who is logged in.

### `toOwner()`

The `toOwner()` directive restricts the current **grant** to those records which are "owned" by the logged in user. You can omit the single parameter and it will look for user's ID on a property called `uid` on the record. If this property is _not_ a valid property on the record it will instead throw an error (code: `invalid-owner-property`). In general, it is probably better to explicitly state the property as was illustrated in the example above.

### `withClaim()`

The `withClaim()` directive restricts the current **grant** to only those users who have a specific Firebase "custom claim." Managing claims is something you must do separately but assuming you have done this then you can state either a _static_ claim (aka, a claim who's name is static and known at design time) or a dynamic claim name which is evaluated at run-time.

In our example, we used a dynamic claim for the `territory` 

### `whereAuthenticated()`

The `whereAuthenticated()` directive restricts the current **grant** to only those who are logged in. A distinction between _anonymously_ logged in users and _known_ users can be made if desired (by default it is _any_ logged in user) by stating which category of user you want the grant to apply to. For instance:

```typescript
const permissions = new Permissions()
  .grant("read").whereAuthenticated("anonymous")
  .grant("read", "write").whereAuthenticated("known")
```

## Associating Permissions to Model

## Permissions (old)

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

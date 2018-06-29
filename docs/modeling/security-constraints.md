# Permissions and Indexes

In addition to data-structure we can also annotate the permission level data should have which  in turn can be translated into Firebase security rules. Further, we have the ability at the property level to indicate which fields should be indexed.

### Permissions

All permissions are configured on a class/model level and consist of the following permission levels:

  - `read-write` - anyone can read or write; outside a demo this is rarily advised
  - `read-only` - public users can read data but no writing is allowed
  - `user-write(prop)` - Users who are listed as the "owner" can write
  - 


### Indexes

You may use any of the following annotations on the property level:

- `@index` - indexes the property in Firebase
- `@uniqueIndex` - same as `@index` wrt Firebase but for some schema exports -- where distinction are made between unique and non-unique indexes -- this can be used to annotate this distinction

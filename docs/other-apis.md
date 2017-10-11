# Other API's

## Record API {#record}

A `Record` is a light wrapper around a _schema derived_ object that provides useful interactions for the data record.

### API

- `initialize(hash)` - you can initialize the record data with a plain hash object (in TypeScript, you'll be warned if this Hash is not a _partial_ of the schema).
- `load(id)` - loads record data from the database
- `update(hash)` - updates the record non-destructively

### Properties
- `data` - read-only access to the record's data
- `existsOnDB` - a flag indicating whether the given record has yet been saved to DB
- `isDirty` - a flag indicating whether local record is variant from what is in the database
- `dbPath` - the path in Firebase where this record exists
- `localPath` - the path in the local state management tooling that this record exists (see Redux)

## List API {#list}

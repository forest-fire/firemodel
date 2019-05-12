# Relationships

Once you have defined relationships inside of your models, you can make use of them through the `Record` class.

## Cardinality / Perspective

Before we talk about `hasOne` and `hasMany` relationships we must define what we mean by them.
For those of you coming from the days of relational databases, you'll certainly recognize the
term **cardinality** which describes the relationship between two entities/models.

If we consider a relationship between a `Person` model and a `Company` model it might look like this:

<process-flow>graph LR;Person-.->Employer("employer");Employer-->| 1:M |Employees("employees");Employees-.->Company</process-flow>

In this case the _cardinality_ is `1:M` if we consider from the perspective of the `Person` but it
would be `M:1` from the perspective of the `Company`. This *perspective* is important to
determine if you should be using a `hasOne` or `hasMany` API. Whenever the side of the relationship which you're operating from is a **M** than you should be using `hasMany` otherwise `hasOne`.

Extending our example, if you were considering from the perspective of the `Person`:

```typescript
// Person has 1:M to Company, which means from person perspective
// we should use the `hasOne` API
await person.setRelationship(Company, '12345');
```

## hasOne ( `1:M` / `1:1` )

A `hasOne` relationship -- also aliased to `belongsTo` and `ownedBy` -- is any relationship
where the Model we are working with has a `1` cardinality as it relates to the foreign model.

### Methods

- `setRelationship` - sets the relationship to FK reference; if there existed a FK relationship before it will be removed first
- `clearRelationship` - clears the FK relationship; no error if there was no pre-existing FK

### Aliases

You can also use:

- `associate` - an alias to "setRelationship" for `hasOne` relationships, and
- `disassociate` - an alias to "clearRelationship" for `hasOne` relationship.

The primary reason to use these aliases is to ensure that a common API can be used across all relationship types where as the explicit API is potentially a more descriptive set of verbs for what is actually happening.

### Examples

In the scenario of a many to one we will make use of the `setRelationship` method.

```ts
// get an existing company based on id
const abcCorp = await Record.get(Company, 'abc-corp')

// create and save a new person
const newPerson = await Record.add(Person, {
  name: "Tom Bart",
  age: 38
})

// add the new person into a relationship with the company
newPerson.associate('company', abcCorp.id)

// save updates including the relationship
newPerson.update({})
```

The `associate` method will take an array of strings as the second argument when your model contains a `hasMany` property.

```ts
abcCorp.associate('people', [newPerson.id, newPerson2.id])
```

To remove a relationship, we can make use of the `disassociate` method, this method is making use of the underlying `removeFromRelationship` method.

```ts
// create and save a new person
const harryKhan = await Record.get(Person, 'harry-khan')

// get an existing company based on id
const abcCorp = await Record.get(Company, 'abc-corp')

// add the new person into a relationship with the company
abcCorp.disassociate('people', harryKhan.id)

// save updates including the relationship
abcCorp.update({})
```

The `disassociate` method will take an array of strings as the second argument when your model contains a `hasMany` property.

```ts
abcCorp.disassociate('people', [harryKhan.id, newPerson.id])
```

## hasMany ( `1:M`, `M:M` )

A "hasMany" relationship has a cardinality of either `1:M` or `M:M` but the important characteristic from an API standpoint is that the **Record** which you are working on has 
one or more of the FK relationship.

### Methods

The methods you will use to work with a `1:M` relationship are:

- `addToRelationship` - adds another FK to an existing relationship
- `removeFromRelationship` - removes one of the FK relationships on the given property
- `clearRelationships` - removes ALL FK relationships of a given property

> **Note:** these same properties can be used for `M:M` relationships; **FireModel** will ensure in
> both cases that the appopriate DB paths are updated

### Aliases

You can also use:

- `associate` - an alias to "addToRelationship" for `hasMany` relationships, and
- `disaccociate` - an alias to "removeFromRelationship" for `hasMany` relationships.
  
The primary reason to use these aliases is to ensure that a common API can be used across all relationship types where as the explicit API is potentially a more descriptive set of verbs for what is actually happening.

### Options

All methods have a trailing `options` parameter which offers the following options:

```typescript
export interface IFmRelationshipOptions {
  /**
   * Ensure that FK being referenced actually exists; throw error if not.
   * Default is false.
   */
  validateFk?: boolean;
  /**
   * Allows the given operation to be executed against the database but to
   * NOT send the events to the `dispatch()` function. Default is false.
   * In general this should be avoided except for Mock's and in testing
   * functions but possibly there are other use cases.
   */
  silent?: boolean;
}
```

### Examples

To create a relationship we can use this sugar method called `associate`, this method is making use of the underlying `addToRelationship` method.

```typescript
// create and save a new person
const newPerson = await Record.add(Person, {
  id: 'harry-khan', // normally you'd let firemodel create this for you
  name: "Harry Khan",
  age: 22
})
// get an existing company based on id
const abcCorp = await Record.get(Company, 'abc-corp')

// add the new person into a relationship with the company
await abcCorp.associate('people', newPerson.id)
// alternatively, we can use the core method for 1:M relns
await abcCorp.addToRelationship('people', newPerson.id);
```

And then to remove **Harry** from ABC we would:

```typescript
const abcCorp = await Record.get(Company, 'abc-corp')
// removes using an alias
await abcCorp.disassociate('people', 'harry-ghan')
// alternatively, we can use the core method for 1:M relns
await abcCorp.removeFromRelationship('people', 'harry-ghan')
```

And if, in our continuing saga, ABC Corp goes out of business (and therefore employs no one)
we can do the following:

```typescript
const abcCorp = await Record.get(Company, 'abc-corp');
await abcCorp.clearRelationships('people');
```

## Async Values, Dispatch, and Errors

### Record Values

When you call any of the relationship methods discussed above the `Record` you're operating on will *immediately* change to reflect the updated values. Of course the value "officially" updating is an asynchronous process so in many cases it's best to call the methods with an await to ensure the change has completed on the database. Let's illustrate with two examples:

```typescript
// update a relationship and wait until its been update before moving on
await abcCorp.disassociate('employees', '1234');
// make some more reln adjustments but don't wait and do them in parallel
const newEmployee = abcCorp.associate('employees', 'better-employee');
const newProduct = abcCorp.associate('products', 'my-new-product');
// at this point values on local records will be updated
if (abcCorp.get('employees').includes('better-employee')) {
  // This WILL evaluate to true
}
// but we can still ensure that all operations are done before we leave
await Promise.all([newEmployee, newProduct]);
```

### Dispatch

The _dispatch functionality_ is typically used to monitor/cache changes in state within long running
processes. Since Firebase is a "real time database" it is well suited to providing an event stream
approach in communicating state change.

As this relates to **relationships** we cover this somewhat generically in the
[Dispatch and Events](././dispatch-and-events#origination-flow.html) section, it's important to
understand that the _dispatch_ functionality will also provide information at
each stage of the transaction.

Here's a diagram that illustrates the dispatch events when we originate the change:

<process-flow>graph LR;Event("RELATIONSHIP_ADDED_LOCALLY")-->Outcome{"both models updated?"}; Outcome-->|yes|Confirmation["RELATIONSHIP_ADDED_CONFIRMATION"]; Outcome-->|no|Rollback["RELATIONSHIP_ADDED_ROLLBACK"]; style Rollback stroke: red,stroke-width:2;</process-flow>

Interestingly, when a relationship is originated _outside_ of Firemodel (not recommended) it will show up as two events. One for each model:

<process-flow>graph TD;START("External Update")-->PK["PK: RECORD_UPDATE"];START-->FK["FK: RECORD_UPDATE"];</process-flow>

Obviously if some external agent were to _try_ and update a relationship and then rollback it would result in no events as the database never actually changed. 

> **Note:** The biggest risk of external agents making the update is that they may update only one side of a relationship and leave the overall state out of balance.

### Errors

All errors that are encountered will be some derivative of the `FireModelError` class with both `code` and `name` properties to work off of. You should be sure to always handle errors with
`try..catch` blocks although the level in your application/function will be left up to you. Errors specific to relationships includes:

| specific to reln | used throughout |
| ------------------|------------------|
|`fk-does-not-exist`|`record-not-found`|

Always remember, documentation and code can separate so always validate the code whenever you are in doubt. You can refer to the `src/errors` directory to have some sense for the errors which you may encounter (but some are not yet in this directory structure).

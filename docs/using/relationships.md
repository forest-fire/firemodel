# Relationships

Once you have defined relationships inside of your models, you can make use of them through the `Record` class. The value of relationships is not only that you can create links between entities but that you can maintain denormalized two-way links between these entities without any effort from the consumer of the **Firemodel** library.

This two way links allow easy navigation from both sides of the relationship to the other. In traditional Relationsional DB's this is all addressed for you assuming you keep your data model to [2nd (or 3rd) normal form](https://en.wikipedia.org/wiki/Second_normal_form) but this linking is left up to you in a database like Firebase. Fortunately when using **Firemodel** this linking is done for you and you as the consumer of Firemodel can go back to _using_ relationships and not worrying about maintaining them.

In **Firemodel** you will first define the relationships in the model definitions (see [modeling Relationships](/modeling/relationships.html)) and then _use_ them with the API provided by the `Record` class. There are two API's you will use depending on the _cardinality_ (see next section) of the relationship or you can opt to use a more generic syntax and use the same API for all relationship cardinalities. Here are some simple examples:

```typescript
const joe = await Record.add(Person, { name: "Joe", age: 41 });
// examples of hasMany API
await joe.addToRelationship("skillset", "project-mgmt");
await joe.addToRelationship("skillset", "programming-c++");
await joe.addToRelationship("skillset", "programming-java");
// example of hasMany with alias syntax
await joe.associate("skillset", "programming-javascript");

// example of hasOne API
await joe.setRelationship("employer", "microsoft");
// example of hasOne with alias syntax
await joe.associate("boss", "12355454")
```

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

- `setRelationship` - sets the relationship to FK reference; if there existed a FK relationship before it will be removed first.
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
await newPerson.associate('company', abcCorp.id)
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

> **Note:** these same properties can be used for `M:M` relationships; **Firemodel** will ensure in
> both cases that the appopriate DB paths are updated

### Aliases

You can also use:

- `associate` - an alias to "addToRelationship" for `hasMany` relationships, and
- `disaccociate` - an alias to "removeFromRelationship" for `hasMany` relationships.
  
The primary reason to use these aliases is to ensure that a common API can be used across all relationship types where as the explicit API is potentially a more descriptive set of verbs for what is actually happening.

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

## API Options

### API Options

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
  /**
   * By default if you set a relationship and that relationship _already_ existed
   * then it will be ignored with the assumption that this an affirmation of an
   * existing relationship. If instead you want this represent an error you can
   * set this to `true` and it will throw the `firemodel/duplicate-relationship`
   * error.
   *
   * If this remains in the default state of `false` and Firemodel can detect this
   * state without doing any additional DB queries it will fire a
   * `RELATIONSHIP_DUPLICATE_ADD` dispatch event. This shouldn't be relied on but
   * can sometimes proactively alert developers in development of unintended
   * behavior.
   */
  duplicationIsError?: boolean;
}
```

> As is always the case, interfaces or types specified in this documentation will attempt
> to be up-to-date but they are always exposed by this library so expect the typings that
> are exported the "official documentation". This typing is defined in `src/@/types/relationships`.

## Async Values and Dispatch

### `Record` Property Values

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

The _dispatch functionality_ is typically used to monitor/cache changes in state where you are operating in long running processes (which is typically the case in modern SPA frontends and more traditional backend servers). Also, since Firebase is a "real time database" it is well suited to providing an event stream approach in communicating state change and is typically a better way of maintaining state than isolated state objects like `Record` when you're operating in this _long-running_ environment.

As `dispatch` and event streams relates to **relationships** we cover this somewhat generically in the [Dispatch and Events](././dispatch-and-events#origination-flow.html) section becuase it's important to understand that the _dispatch_ functionality will also provide information at
each stage of a two-phased transaction. Here we will talk specifically about how this two phased transaction plays out for a relationship.

Here's a diagram that illustrates the dispatch events when we originate the change:

<process-flow>graph LR;Event("RELATIONSHIP_ADDED_LOCALLY")-->Outcome{"both models updated?"}; Outcome-->|yes|Confirmation["RELATIONSHIP_ADDED_CONFIRMATION"]; Outcome-->|no|Rollback["RELATIONSHIP_ADDED_ROLLBACK"]; style Rollback stroke: red,stroke-width:2;</process-flow>

The first thing to note is that **Firemodel** uses Firebase's often underestimated "multi-path set" operation to ensure that both models are set or neither are. This ensures the [_atomicity_](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) of the transaction. However, in the case of optimistic changes that consumer may choose to make at the stage of the `RELATIONSHIP_ADDED_LOCALLY` stage, the _rollback_ event must be used to rollback these changes.

Interestingly, when a relationship is originated _outside_ of Firemodel (not recommended) it will show up as two events. One for each model:

<process-flow>graph TD;START("External Update")-->PK["PK: RECORD_UPDATE"];START-->FK["FK: RECORD_UPDATE"];</process-flow>

Obviously if some external agent were to _try_ and update a relationship and fail it would result in no events as the database never actually changed.

> **Note:** The biggest risk of external agents making the update is that they may update only one side of a relationship and leave the overall state out of balance.

## Errors

All errors that are encountered will be some derivative of the `FiremodelError` class with both `code` and `name` properties to work off of. You should be sure to always handle errors with
`try..catch` blocks although the level in your application/function will be left up to you. Errors you may encounter when working with relationships include:

| Reln Specific Error | Record error |
| ------------------|------------------|
| `fk-does-not-exist` | `record-not-found` |
| `missing-reciprocal-inverse`   | `dynamic-properties-not-ready` |
| `incorrect-reciprocal-inverse`  |     |
| `duplicate-relationship` |   |
| `not-hasMany-reln` |   |

Always remember, documentation and code can separate so always validate the code whenever you are in doubt. You can refer to the `src/errors` directory to have some sense for the errors which you may encounter (but some are not yet in this directory structure).

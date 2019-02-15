# Relationships

## Using relationships
Once you have defined relationships inside of your models, you can make use of them through the `Record` .

There are a few methods available when dealing with relationships:

**Sugar methods**
- associate
- disassociate

**Actual implementations**
- addToRelationship
- setRelationship
- removeFromRelationship
- clearRelationship

### One to Many ( `1:M` )

To create a relationship we can use this sugar method called `associate`, this method is making use of the underlying `addToRelationship` method.

```ts
// create and save a new person
const newPerson = await Record.add(Person, {
	name: "Harry Khan",
	age: 22
})

// get an existing company based on id
const abcCorp = await Record.get(Company, 'abc-corp')

// add the new person into a relationship with the company
abcCorp.associate('people', newPerson.id)

// save updates including the relationship
abcCorp.update({})
```

To remove a relationship, we can make use of the `disassociate` method, this method is making use of the underlying `clearRelationship` method.

```ts
// create and save a new person
const harryKhan = await Record.get(Person, 'harry-khan')

// add the new person into a relationship with the company
harryKhan.disassociate('company')

// save updates including the relationship
harryKhan.update({})
```

### Many to One ( `M:1` )

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


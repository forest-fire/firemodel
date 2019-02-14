# Relationships

## Using relationships
Once you have defined relationships inside of your models, you can make use of them through the `Record` .

There are a few methods available when dealing with relationships:

- addToRelationship
- setRelationship
- removeFromRelationship
- clearRelationship


### One to Many ( `1:M` )

In the scenario of a one to many we will make use of the `addToRelationship` method.

```ts
// create and save a new person
const newPerson = await Record.add(Person, {
	name: "Harry Khan",
	age: 22
})

// get an existing company based on id
const abcCorp = await Record.get(Company, 'abc-corp')

// add the new person into a relationship with the company
abcCorp.addToRelationship('people', newPerson.id)

// save updates including the relationship
abcCorp.update({})
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
newPerson.setRelationship('company', abcCorp.id)

// save updates including the relationship
newPerson.update({})
```

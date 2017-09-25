# Model Usage

## Overview


## One-Time Retrieval {#one-time}

```ts
const db = new DB();
const person = new Model(new Person(), db);
const joe = await person.get('1234');
const people = await person.orderByKey('age').limitToFirst(10).get();
```

## Events/Streams {#events}

```ts
const db = new DB();
const person = new Model(new Person(), db);
// Child Event Listeners, with redux dispatch
const stream: ListStream<Person> = person.listenForChildren('added', 'removed');
stream.on('added', (evt) => redux.dispatch( stream.action(evt) ));
// Value Event, with redux dispatch
const vstream: ListStream<Person> = person.listenForValue();
// Value Event on single record
const vstreamSingle: NodeStream<Person> = person.listenForValue('1234');
// Hybrid → Value then Child events
const hybridStream: ListStream<Person> = person.listen();
hybridStream.on('value', (evt) => console.log('initial records loaded'));
hybridStream.on('change', (evt) => redux.dispatch( hybridStream.action(evt) ));

// Working with Records and Relationships
const joe = new Record(new Person(), '1234');
const mother = joe.mother; // inline policy means synchronous access
const father = await joe.father(); // async because default policy is "lazy"
// Adding a new Record
const newPerson = new Record<Person>();
newPerson.name = { first: 'Bob', last: 'Barker' };
const pk = newPerson.push();
// Modifying an existing record
const existingPerson = new Record<Person>(pk);
existingPerson
  .setAge(99)
  .addSibling('5555')
  .update();
```

## Relationships {#relationships}


## Mocking {#mocking}



# Redux
> Integration with Local State Management 

Arguably the most popular of the local statement management frameworks is **Redux**. In many ways, **Firemodel** was designed to work hand-in-hand with Redux but to understand how to integrate Redux we need to look at from two perspectives:

1. Firing events
2. Mutating local state based on events

##### Firing Redux Events

For those of you who know the framework you may have already noticed that the [`IFMAction`](https://github.com/forest-fire/firemodel/blob/master/src/event.ts#L9) event names conform to convention in the redux community (aka, uppercase letters, snake cased words, etc.).

that are sent as the `type` property of every `IFMEvent` conform to many 

coming from conform to the structure of a Redux "action." So if you wanted all state changes coming from the database to be put into your Redux flow you could create a handler that looks like so:

```ts
import { DB } from 'abstracted-admin';
import { Model } from 'firemodel';
import { Person } from './schemas/index';
import { dispatch } from 'redux';

const listener = (dispatch) => (event: IFMEvent) => {
  dispatch(event);
}

const person = new Model<Person>(Person, db);
person.listenTo(listener(dispatch));
```

Since this is a very common use-case there is static property on the `Model` class which you can set like so:

```ts
import { Model } from 'firemodel';
import { Person, Company, Website } from './schemas/index';
import { dispatch } from 'redux';

// Set listener for all Models
Model.listener = (event: IFMEvent) => dispatch(event);
// Start listening on a given Model
const person = new Model<Person>(Person, db);
person.listenTo();
const website = new Model<Website>(Website, db);
website.listenTo();
// Override the global where needed
const company = Model<Company>(Company, db);
company.listenTo(myUniqueListener);
```

This will ensure that all new models will use the Redux dispatch for events (unless you explicitly opt-out).

##### Responding to Events

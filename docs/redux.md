# Redux
> Integration with Local State Management 

Arguably the most popular of the local statement management frameworks is **Redux**. In many ways, **Firemodel** was designed to work hand-in-hand with Redux but to understand how to integrate Redux we need to look at from two perspectives:

1. Firing events (action creators / epics)
2. Mutating local state based on events (reducers)

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

If you're using Redux (or any state management framework), you're likely to want to do the same thing across models; this is possible by setting the static property on the `Model` class like so:

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
```

Because Redux was imagined when building this component, that is all that's needed to have the appropriate async events sent to Redux.

##### Responding to Events / Redux Controllers



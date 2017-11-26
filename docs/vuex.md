# Vuex
> Integration with Local State Management 

The built-in state management framework for VueJS is Veux and it too can integrate with a few helper functions. This is more pronounced on the 

with the events like so:

```ts
import { Model, VuexEvent, VuexActions } from 'firemodel';

// Set listener for all Models
Model.listener = (event: IFMEvent) => this.$store.dispatch(...VuexEvent(event));
```

Then in your the **Vuex** `store.js` file you'd add something like the following:

```ts
{
  // ...
  actions: {
    ...VuexActions,
    ...yourOwnActions
  }
}
```

mutations == reducers

# Frontend State Mgmt

Without really meaning to start the conversation, the [Watching Firebase](./watching.html) section  brought up the idea of a "dispatch" function which gets called when a change takes place in Firebase which is being _watched_ by the client. For those of you familiar with Redux and/or Vuex (probably MobX too) there is shared nominclature in having a "dispatch" function. That's good as it suggests a possibly easy integration but that's just a part of the picture so let's explore the whole space.

Ultimately the goal we're trying to achieve is to find a low friction way of ensuring that the local datastore is kept optimistically up-to-date with changes in state. Changes that originate both from the client and external to the client.

> what we mean by "optimistically" is discussed in greater length further on

## Integrating State

When we concern ourselves with integrating state into modern state management frameworks we'll use Redux and Vuex as exemplars but I believe most are very similar (but don't want to step outside my understanding). Broadly there are two things we will need to do:

- **Dispatch** - dispatch Firebase events that we've either originated (via `Record` or `List`) or become aware of (via `Watch`) into the state management frameworks via their provided callback method.
- **State Mutation** - we then must create synchronous functions that convert the *event* into a state change.

### Dispatch

Integrating both phases of state change into your state management framework are accomplished **with a single line of code!**

#### Redux
```typescript{3}
import { dispatch } from './store';
import { Record } from 'firemodel';
Record.dispatch = dispatch;
```

#### Vuex
```typescript{3}
import { dispatch } from './store';
import { Record, VeuxWrapper } from 'firemodel';
Record.dispatch = VuexWrapper(dispatch);
```

That's it. Now Firemodel events will be fired right into your frontend framework.

> The [`VuexWrapper`](https://github.com/forest-fire/firemodel/blob/master/src/VuexWrapper.ts) is just a simple mapper which addresses the mild variant between Redux and Vuex's callback requirements. 

### State Mutation

Assuming you followed the instructions above regarding _dispatch_, your state management framework is getting actions but it's not actually modifying state yet. In Redux you'd write *reducers* to do this, in Veux you'd write *mutations*.

You are free to write your own reducers/mutations that trigger off the **FireModel** events but you don't need to because we ship with a set that should suit 95% of use cases. Here's how you'd setup your store in Vuex:

```typescript
import Vuex from "vuex";
const store = new Vuex.Store({
  modules: {
    "@firemodel": VuexMutations,
    ... 
  },
  ...
});

Vue.use(Vuex);
new Vue({
  el: "#app",
  router,
  store,
  template: "<App/>",
  components: { App }
});
```

> **Note:** for now I've only written for Vuex as that's currently focus but please send me a PR for a Redux, Mobx, etc. version; I'm sure the translation would be relatively trivial

In many cases you may write your own but the structure and context of **FireModel** means we can ship with reducers which may just work for you "out of the box".  






## Being Optimistic

What is meant by _being optimistic_ is simply that when a client originates a change, the client should be able to respond to that change immediately even though a full round-trip to the database is needed before this change is formally accepted. That means that there is a lifecycle of client-originated change that looks like this:

![](../images/OptimisticState.jpg)

This contrasts with changes in state that originate externally:

![](../images/ExternalStateChange.jpg)

Let's walk the client-originated event through a quick "for instance":

- let's say the client decides to change a `Person`'s "favoriteColor" from *blue* to *orange*
- they set the state locally with something like:

  ```typescript
  const dude = Record.get(Person, "1234");
  console.log(dude.data.favoriteColor); // blue
  await dude.set('favoriteColor', "orange");
  ```
- immediately an event is fired where the change is announced to `dispatch` (note: the `source` property is to "client" to indicate that the event originated from the client not the database)
- at the same time the `set` operation is sent to Firebase so the client's desire will eventually be achieved
- the `await` instruction in the code waits until Firebase confirms it has accepted the change and if it does the Record class looks to see if there is a watcher on this record. 
  - If there is then it exits; 
  - if there isn't then it fires another event to `dispatch` to indicate the server's acceptance (aka, same payload as first time but `source` is now "database")

**FireModel**'s provides means for two ways to understand where in that cycle a change is. The first way is just recognizing the async/await state of write ops on `Record` or `List` classes:

```typescript
// Record example
const bobby = await Record.get(Person, "1234");
bobby.set('favoriteColor', 'orange');
await bobby.update()
// List example
const folks = await List.recent(Person, 25);
await folks.add({ name: "Donald Duck", age: 12 });
```

the `update` and `add` operations are asynchronous so waiting for it means you are waiting from the start of phase 1 to the conclusion of phase 2. This may be true but it has no real bearing on a frontend state management's state. That is the topic for the next section ... integrating state.


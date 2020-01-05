# Frontend State Mgmt

## Overview

When working with modern frontend frameworks like Vue and React it is likely we are using a front-end _state management framework_ like **Redux** or **Vuex**. These frameworks work really well with a "real-time database" like Firebase and can be integrated relatively easily.

Without really meaning to start the conversation of frontend state management, the [Watching Firebase](./watching.html) section brought up the idea of a `dispatch()` function which gets called when a change takes place. For those of you familiar with Redux or Vuex there is shared nominclature in having a "dispatch" function and that is in fact where we'll start when talking about integration.

When integrating state into a frontend state management frameworks broadly there are three things we will need to do:

- **Dispatch** - connect your frontend framework's _dispatch_ to Firemodel
- **Actions** - ensure we have all the required Firemodel _Actions_ defined in our local store
- **Mutations** - ensure all the _Mutations_ (or reducers in Redux parlance) committed by the Actions are available to change state

While any frontend framework should be able to be integrated, we have primarily focused on VueJS and Vuex in recent years. For Vuex we have an "out of the box" solution which can be used as either a Vuex Plugin or a CLI plugin. For more on this go to the [Vuex and Vue CLI plugins](#Vuex) section.

## Dispatch

The good news is integrating your framework's `dispatch` into Firemodel is _super_ easy:

### Vuex (` src/main.ts `)

```typescript
import { dispatch } from './store';
import { Record, VeuxWrapper } from 'firemodel';
Record.dispatch = VuexWrapper(dispatch);
```

> **Note:** The [`VuexWrapper`](https://vuex.firemodel.info) is just a simple mapper which addresses the mild variant between Redux and Vuex's callback requirements.

### Redux

```typescript
import { dispatch } from './store';
import { Record } from 'firemodel';
Record.dispatch = dispatch;
```

At this point, any time a Firemodel mutation is fired it will be fired _into_ Vuex/Redux.

## Events, Actions and Mutations

Assuming you followed the instructions above regarding _dispatch_, your state management framework will now be getting *Events* sent to it from **Firemodel**. These events will have a `type` which must be matched by an Action in your local store. Further, Actions do not modify state directly, instead they call *mutation* functions (or *reducers* in Redux parlance). The diagram below shows the high-level flow:

So if you're following along, you'll expect that the responsibility for writing the database Actions and Mutations would fall to you as the consumer of this library and you _can_ do this if you choose but in 99% of cases you should instead use the `vuex-plugin-firemodel` which provides both for you automatically. See the next section for more details.

## Firemodel Plugin

Because the **Firemodel** events provide a lot of surrounding meta information, it is possible to build a generic set of _Actions_ and _Mutations_ which handle all the database events which **Firemodel** will fire.

If you're using Vuex, please install the [`vuex-plugin-firemodel`](https://github.com/forest-fire/vuex-plugin-firemodel) npm module into your frontend application and add it to your store:

### `src/store.ts`

```typescript
import FirePlugin from 'vuex-plugin-firemodel';
const store = new Vuex.Store<IRootState>({
  /** your config goes here */
  plugins: {
    FirePlugin,
    /** other plugins */
  },
})
```

At this point you will _already_ have handlers for all of the **Firemodel** actions (see [action types](/using/dispatch-and-events.html#enumerating-events)) but mutations must be defined *within* the modules of your state tree. If you aren't clear on the use of "modules" in Vuex please review that first before continuing.

Let's explore an example of how this could be configured. In our example we'll have a **Firemodel** `Model` called `UserProfile` and in our local state tree we want to save the logged in user to the state tree at `/userProfile`. This means we must define a Vuex module called `userProfile` and it would be defined something like this:

### `src/store/userProfile.ts`

```typescript
import UserProfile from "../models/UserProfile";
import { firemodelMutations } from "vuex-plugin-firemodel";

/**
 * the default state for UserProfile
 */
export const state: UserProfile = {
  name: '',
  uid: '',
}

export const getters: GetterTree<IUserProfileState, IRootState> = {
  ...
}

const mutations: MutationTree<IUserProfileState> = {
  ...firemodelMutations<UserProfile>(),
}

const vuexModule: Module<IUserProfileState, IRootState> = {
  state,
  mutations,
  getters,
  namespaced: true,
}

export default vuexModule
```

and then ensure that your root store configuration includes this module:

### `src/store.ts`

```typescript
import FirePlugin from 'vuex-plugin-firemodel';
import userAuth from './store/userAuth';

const store = new Vuex.Store<IRootState>({
  modules: {
    userAuth
  },
  plugins: {
    FirePlugin
  }
})
```

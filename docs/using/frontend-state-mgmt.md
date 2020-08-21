# State Mgmt / Dispatching

## Overview

When working with modern frontend frameworks like Vue and React it is likely we are using a front-end _state management framework_ like **Redux** or **Vuex**. These frameworks work really well with a "real-time database" like Firebase and can be integrated with **Firemodel** relatively easily.

While any frontend framework should be able to be integrated, we have primarily focused on VueJS and Vuex in recent years. For Vuex we have an "out of the box" solution which can be used as either a Vuex Plugin or a CLI plugin. For more on this go to the [Vuex and Vue CLI plugins](#vuex-and-vue-cli-plugins) section.

For the benefit of people using other frameworks we'll discuss briefly what "integration" really means and you can look at the Vuex plugin to see what might be involved in integrating **Firemodel** into your framework of choice.

## What is involved in Integration?

When integrating state into a frontend state management frameworks broadly there are three things we will need to consider:

- **Dispatch** - connect your frontend framework's _dispatch_ to Firemodel
- **Actions** - ensure your store can respond to all Firemodel _Actions_ 
- **Mutations** - ensure all the _Mutations_ (or reducers in Redux parlance) committed by the Actions are available to change state

As has been demonstrated with the Vuex plugin, all three can be integrated to a point where your involvement in configuring the store is 95% taken care of for you.

### Dispatch

Both Vuex and Redux use the term "dispatch" to indicate the sending of a message to the framework about some change in state. While other frameworks may have a different term, this is what we are referring to here and integrating it with **Firemodel** is dead simple.

In Vuex, we can add what is in essence a "one-liner":

#### Vuex (` src/main.ts `)

```typescript
import { dispatch } from './store';
import { FireModel, VeuxWrapper } from 'firemodel';
FireModel.dispatch = VuexWrapper(dispatch);
```

In Redux it's just about the same (only a wee bit easier):

#### Redux

```typescript
import { dispatch } from './store';
import { FireModel } from 'firemodel';
FireModel.dispatch = dispatch;
```

At this point, any time Firemodel makes a change to state it fires a dispatch message.

### Actions and Mutations

Once _dispatch_ is setup, your state management framework will now be getting *Events* sent to it from **Firemodel**. These events will have a `type` which must be matched by an **Action** in your local store. Actions are asynchronous and guide the state management workflow but do not directly modify state, instead they call *mutation* functions (or *reducers* in Redux parlance) which actually make the state change in the frontend's state.

You might expect that the responsibility for writing the database Actions and Mutations would fall to you as the consumer of this library and you _can_ do this if you choose but the patterns for state change are very strong and therefore it is possible to do most of the heavy lifting in a generic way. That is indeed what we've done with the Vuex plugin (see next section) but this approach should be very similar for Redux and likely for other frontend frameworks too.

## Vuex and Vue CLI plugins

Vuex provides a convenient plugin architecture that allows us to provide all of the needed dependencies, integration between Vuex and Firemodel, as well as additional features not yet discussed. This plugin -- [`vuex-plugin-firemodel`](https://github.com/forest-fire/vuex-plugin-firemodel) -- has it's own documentation site which can be found at:

- [https://vuex.firemodel.info](https://vuex.firemodel.info)

To avoid duplication we will not go into great depth here but we do want to mention another level of abstraction that is available to VueJS users who use the Vue CLI. For these users, getting everything you need to start using Firemodel is as simple as:

```bash
vue add firemodel
```

> **Note:** the VUE CLI is coming _very_ soon but has not yet been released to the wild
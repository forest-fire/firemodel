# Getting Started

Hey the **usage** section seems important. After all, just _modeling_ would be a rather pointless exercise if we weren't going to actually USE these damn models. Well I'm as excited as you probably are right now but we must take one first quick step before we dive in ...

To interact with the database **FireModel** leverages a simple abstraction of Firebase called [`abstracted-firebase`](https://abstracted-admin.com). This library can be useful all by itself but it is critical to using FireModel so we must install it ... well not it "directly" but insted install one of the two:

- `abstracted-admin` - for backend nodejs projects
- `abstracted-client` - for your browser based projects

The two libraries above are really just wrappers around the core functionality implemented in `abstracted-firebase` but heyho ... these are details you don't really need. Just do as your told and install one of the above to your project:

```shell
# backend
yarn add abstracted-admin
# front
yarn add abstrated-client
```

Ok, the fun is ready to start. Click "reading" or any of the other CRUD related links to dive in.

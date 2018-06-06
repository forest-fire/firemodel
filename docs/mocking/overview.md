# Overview

When I first started testing I remember thinking that mock testing must be hard. That was a good
enough reason to avoid it like the plague for a few years but you can't outrace the plague. To my
surprise I realized that _mocking_ doesn't have to be hard.

This led me initially to create the [`FireMock`](https://www.firemock.com/) library -- which you can use
independantly of this library -- but because **Firemodel** has contextual knowledge of how your data structures
are setup it mocking is even easier with **Firemodel** _leveraging_ the **FireMock** library.

In order to be ready to start your mocking journey with **FireModel** you will need to install **FireMock** locally to your project:

```shell
yarn add --dev firemock
```

This ensures that the underlying _firemock_ dependency doesn't make it into your production code (even if you're a fancy "tree shaker"). Once this is added as a _devDependency_ use of the library will be transparent.

Enjoy and start mocking (your code not me).

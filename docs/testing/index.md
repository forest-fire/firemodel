# Mocking Overview

![overview](../images/Mime-800.jpg)

When I first started testing I remember thinking that mock testing must be hard. That was a good
enough reason to avoid it like the plague for a few years but you can't outrun the plague. To my
surprise I realized that _mocking_ doesn't have to be hard.

This led me initially to create the [`FireMock`](https://www.firemock.com/) library -- which you can use
independantly of this library -- but because **Firemodel** has contextual knowledge of how your data structures
are setup it mocking is even easier with **Firemodel** leveraging the **FireMock** library.

In order to be ready to start your mocking journey with **Firemodel** you will need to install **FireMock** locally to your project:

```shell
yarn add --dev firemock
```

This ensures that the underlying _firemock_ dependency doesn't make it into your production code (even if you're a fancy "tree shaker"). Once this is added as a _devDependency_ use of the library will be transparent.

Enjoy and start mocking (your code not me).

## Scope Qualification

A quick disclaimer ... before we claim that the mocking that comes "out of the box" via **FireMock** is the end-all-be-all to mock testing let me state clearly that it is not. There are great libraries like [TestDouble](https://github.com/testdouble/testdouble.js) and [Sinon](http://sinonjs.org/). These are more typical Mock libraries and help mocking all sorts of things. What FireMock is providing is simple way to mock your database interaction. It doesn't help you mock classes, objects, functions, etc. in your code.

Feeling a bit deflated? Don't worry my friend ... mocking your database interaction is probably the most common thing you'll need to mock so you're still in a happy place and now you have two links to other libraries if you want to go further.

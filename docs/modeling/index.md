# Overview

![](../images/data-model.png)

Traditionally one of the benefits of dynamic languages like JavaScript was you could _fluidly_ build your data structures. This thinking also applied to no-SQL databases like Firebase which just ask that you send in JSON data. This fluidity has it's place in prototypes and demos but as you start to move in building full applications the idea of taking a position on your data model in an explicit way starts to make more sense. This is a big part of what **Firemodel** is here to do.

The basics of modeling with **Firemodel** will center around the `Model` class and more importantly a small set of "decorators" which will provide the meta-information about your model that will feed not only your Firebase backend but also modern state management tools like Redux, Vuex, etc.



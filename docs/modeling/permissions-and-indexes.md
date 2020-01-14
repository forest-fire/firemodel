---
sidebarDepth: 3
---
# Permissions and Indexes

> NOTE: THIS IS A WORK IN PROGRESS; DO NOT EXPECT THIS TO WORK YET

## Permissions

Firebase provides a set of permissioning rules for the database which are _critical_ for any production database. Often, however, we start by having a lax policy of access and only consider permissions at the end as we are "productionizing" or "hardening" the solution. This is not a good idea for a number of reasons not least of which the use of these rules may actually influence your decisions on how to model your data!

While not yet implemented, the intent is to lower the friction in this process by allowing a the model definitions to notate security rules. This is not actually as straight forward as you might think as the means these rules take are often not entirely contained by the scope of a `Model`.

In the mean time, we have forked a library called `firebase-rules` and you can find our improved version at [forest-fire/firebase-rules](https://github.com/forest-fire/firebase-rules). This library provides a much better alternative to writing rules than trying to hand write them. We will eventually find a way to integrate this library with Firemodel in a way that makes sense.

## Indexes

Very similar story with Indexes. We do provide two decorators `@index` and `@uniqueIndex` for you to ornament your models with but at this point in time these are not used to create Firebase indexes (they are used by the Dexie Integration). At the point that we integrate security configuration into **Firemodel** we will also very likely introduce indexing and unlike security rules the indexes do align very nicely from a _scoping_ standpoint with models (specifically with properties on models).

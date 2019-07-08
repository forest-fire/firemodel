# Dexie Integration [ future ]

[Dexie](http://dexie.org/) is a great little API for working with IndexDB and now that service workers have gained large scale adoption it's more and more likely you'll want to look into modern client storage. The idea is that (not implemented yet), that **Firemodel** will expose a simple API such as:

```typescript
import FireModel from "firemodel";
FireModel.exportDexie('/models/dexie');
```

And this would produce the appropriate schema definition for you models to be managed by Dexie. As this is not yet implemented feel free to consider this PR territory (or you can magically wish me more time).

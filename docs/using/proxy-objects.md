# Proxy Objects

Today the `List` and `Record` classes offset their data payload onto the `data` property. This is a reasonable compromise as this avoids dangerous namespace collisions between the model's properties and the two objects API surface.

That said there is a more elegant solution that involves the use of Javascript Proxy objects. The [browser support](https://caniuse.com/#feat=proxy) is very good now (though no IE). The main reason this library hasn't switched over yet is due to bandwidth. 

If you're interested in getting some hands on with Proxy objects and fancy a PR I'm very happy to work with you on this.

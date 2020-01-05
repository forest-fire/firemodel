# Overview

<iframe
  src="https://codesandbox.io/embed/a-simple-model-sux95?view=editor&hidenavigation=1&previewwindow=tests&module=/src/models/Person.ts,/src/models/Company.ts,/src/models/Hobby.ts"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

> Example of three models designed with **Firemodel**

Traditionally one of the benefits of dynamic languages like JavaScript was you could _fluidly_ build your data structures. This thinking also applied to no-SQL databases like Firebase which just ask that you send in JSON data. This fluidity has it's place in prototypes and demos but as you start to move in building full applications the idea of taking a position on your data model in an explicit way starts to make more sense. This is a big part of what **Firemodel** is here to do.

The basics of modeling with **Firemodel** will center around the `Model` class and more importantly a small set of "decorators" which will provide the meta-information about your model that will feed not only your Firebase backend but also modern state management tools like Redux, Vuex, etc.

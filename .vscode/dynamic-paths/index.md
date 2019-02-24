# Dynamic Paths

The term _dynamic-paths_ refers to the use of the [Model Constraint](../modeling/model-constraints.html) property **dbOffset** and specifically the inclusion of a non-static path such as ":group" in that property. Use of dynamic paths is reserved for situations where certain parts of your data is divided in large part by a property (or more) in your model and you want to preserve the ability to query and filter results on the server side beyond these variables.

Deciding to use dynamic paths should be done with caution but it can open up performance benefits which are worth having. To understand the basics of why you might do this and how to use Models which have dynamic paths you should 

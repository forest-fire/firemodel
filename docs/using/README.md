# Start Using Firemodel

![](../images/data-stream-1000.jpg)

Hey the **usage** section seems important. After all, just _modeling_ would be a rather pointless exercise if we weren't going to actually USE these damn models. Well I'm as excited as you are so let's dive in. 

In this section we are going to learn how to read, write, and "watch" the database. The primary tools we'll use to do this are the following objects:

- `Record` - work with a specific record
- `List` - work with a list/group of records (of the same Model-_type_)
- `Watch` - add callbacks for notification of changes

These objects are central to usage but it is probably better if we organize around functional usage instead:

- **reading**: one time reads from the database
- **writing**: one time writes to the database
- **watching**: event streams of changes coming from the database

We'll bring the appropriate objects in for each task.


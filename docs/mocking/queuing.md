# Queuing / Executing your Mocks

The concepts of "queueing" and "executing" bear a little explanation as I can imagine they are relatively ripe for interpretation. So here's a quick explanation:

- **Queuing** - the act of taking a "mock schema" and stating that you'd like a certain number of these deployed to the mock database at some future point
- **Execution** - this is the simple act of stating the all those "queued up" requests for mock data to be deployed to the mock database should be done _now_.

Hopefully that makes sense but if not then maybe a few examples will help.

## Queuing Mocks

The most basic form of queuing is represented here:

```typescript
const db = new DB({ mocking: true });
const mock = Model.mock(People, db);
mock.queueSchema(25);
```

This is maybe not that great an example yet but let's review what our takeaways hopefully are:

- The first step in mocking is ensuring FireModel is instructed to go against a mock database; you see that in the initialization of the `db` variable.
- Just like setting up your mocks, the easiest way to get access to the mock is via `Model.mock([SchemaName], [db])`

  > Note: you don't need to set the database each time you call this if you're just running a bunch of tests. It does need to be set initially either by FireModel = db` or via a call to `Model.mock` where you pass in db.

- The only required parameter for queuing is the _quantity_ of records you want to deploy to the mock database.

Let's go one step further with another example:

```typescript
const mock = Model.mock(People);
mock.queueSchema(10);
mock.queueSchema(25, { age: 12 });
```

In this example we've stated the desire to deploy 35 people to the database but the latter 25 should all have their **age** fixed to 12. Of course you can choose any set of attributes to override the normal _faking_ process that would have occurred by default.

Ok well that's about it. Queuing is a pretty simple concept, so let's move onto execution (an even simpler topic).

## Mock Execution

Assuming that you've already queued up some mocks that you want deployed to your mock database the final step is "executing" that deployment. This couldn't be easier:

```typescript
mock.execute();
```

All of your "queued" mocks are now deployed. You may now commence your testing. One last point, all functions coming off the mock interface follow the _fluent_ design pattern and can be combined together like so:

```typescript
Model.mock(People)
  .queueSchema(10)
  .execute();
```

Bam! You now have 10 people in your mock database with faked yet appropriate content for all the records.

![](https://media.giphy.com/media/DfbpTbQ9TvSX6/giphy.gif)

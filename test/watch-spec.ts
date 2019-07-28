// tslint:disable:no-implicit-dependencies
import { Record, Mock, IFmEvent, IFmLocalEvent } from "../src";
import { DB } from "abstracted-client";
import { DB as Admin, SerializedQuery } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import { FireModel } from "../src/FireModel";
import { Watch } from "../src/Watch";
import { Person } from "./testing/Person";
import { PersonWithLocalAndPrefix } from "./testing/PersonWithLocalAndPrefix";
import { setupEnv } from "./testing/helpers";
import { IReduxAction } from "../src/VuexWrapper";
import { FmEvents, IDispatchEventContext } from "../src/state-mgmt";
import { wait, IDictionary } from "common-types";
import { WatchList } from "../src/watchers/WatchList";
import { getWatcherPool } from "../src/watchers/watcherPool";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";

setupEnv();

describe("Watch →", () => {
  let realDB: Admin;
  before(async () => {
    realDB = await Admin.connect();
    FireModel.defaultDb = realDB;
  });
  afterEach(async () => {
    Watch.stop();
  });

  it("Watching a Record gives back a hashCode which can be looked up", async () => {
    FireModel.defaultDb = await DB.connect({ mocking: true });
    const { watcherId } = await Watch.record(Person, "12345")
      .dispatch(async () => "")
      .start();
    expect(watcherId).to.be.a("string");

    expect(Watch.lookup(watcherId)).to.be.an("object");
    expect(Watch.lookup(watcherId)).to.haveOwnProperty("eventFamily");
    expect(Watch.lookup(watcherId)).to.haveOwnProperty("query");
    expect(Watch.lookup(watcherId)).to.haveOwnProperty("createdAt");
  });

  it("Watching CRUD actions on Record", async () => {
    FireModel.defaultDb = realDB;
    const events: IReduxAction[] = [];
    const cb = async (event: IReduxAction) => {
      events.push(event);
    };
    FireModel.dispatch = cb;
    const w = await Watch.record(Person, "1234").start();

    expect(Watch.inventory[w.watcherId]).to.be.an("object");
    expect(Watch.inventory[w.watcherId].eventFamily).to.equal("value");
    expect(Watch.inventory[w.watcherId].watcherPaths[0]).to.equal(
      "authenticated/people/1234"
    );

    await FireModel.defaultDb.remove("/authenticated/people/1234");
    await FireModel.defaultDb.set("/authenticated/people/1234", {
      name: "Bob",
      age: 15
    });
    await FireModel.defaultDb.update("/authenticated/people/1234", {
      age: 23
    });

    const eventTypes = new Set(events.map(e => e.type));

    expect(eventTypes.has(FmEvents.RECORD_CHANGED)).to.equal(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED)).to.equal(true);
    expect(eventTypes.has(FmEvents.WATCHER_STARTING)).to.equal(true);
    expect(eventTypes.has(FmEvents.WATCHER_STARTED)).to.equal(true);
  });

  it("Watching CRUD actions on List", async () => {
    FireModel.defaultDb = realDB;
    const events: Array<IFmLocalEvent<Person>> = [];
    const cb = async (event: IFmLocalEvent<Person>) => {
      events.push(event);
    };
    await realDB.remove("/authenticated/people");
    Watch.list(Person)
      .all()
      .dispatch(cb)
      .start();
    await Record.add(Person, {
      id: "1234",
      name: "Richard",
      age: 44
    });
    await Record.add(Person, {
      id: "4567",
      name: "Carrie",
      age: 33
    });

    await wait(500);
    // Initial response is to bring in all records
    let eventTypes = new Set(events.map(e => e.type));

    expect(eventTypes.has(FmEvents.WATCHER_STARTING));
    expect(eventTypes.has(FmEvents.WATCHER_STARTED));
    expect(eventTypes.has(FmEvents.RECORD_ADDED));
    // Now we'll do some more CRUD activities
    await FireModel.defaultDb.set("/authenticated/people/1234", {
      name: "Bob",
      age: 15
    });
    await FireModel.defaultDb.remove("/authenticated/people/1234");
    await FireModel.defaultDb.update("/authenticated/people/4567", {
      age: 88
    });
    eventTypes = new Set(events.map(e => e.type));
    expect(eventTypes.has(FmEvents.RECORD_CHANGED)).to.equal(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED)).to.equal(true);
    expect(eventTypes.has(FmEvents.RECORD_ADDED)).to.equal(true);
  });

  it("start() increases watcher count, stop() decreases it", async () => {
    Watch.reset();
    FireModel.dispatch = async () => "";
    expect(Watch.watchCount).to.equal(0);
    const { watcherId: hc1 } = await Watch.record(Person, "989898").start();
    const { watcherId: hc2 } = await Watch.record(Person, "45645645").start();
    expect(Watch.watchCount).to.equal(2);
    Watch.stop(hc1);
    expect(Watch.watchCount).to.equal(1);
    expect(Watch.lookup(hc2)).to.be.an("object");
    try {
      Watch.lookup(hc1);
      throw new Error("looking up an invalid hashcode should produce error!");
    } catch (e) {
      expect(e.name).to.equal("FireModel::InvalidHashcode");
    }
  });

  it("Watching a List uses pluralName for localPath unless localModelName is set", async () => {
    FireModel.defaultDb = await DB.connect({ mocking: true });
    Watch.reset();
    const personId = (await Mock(PersonWithLocalAndPrefix).generate(1)).pop()
      .id;
    const person = await Record.get(PersonWithLocalAndPrefix, personId);

    const events: IDictionary[] = [];
    FireModel.dispatch = async evt => {
      events.push(evt);
    };
    await Watch.list(PersonWithLocalAndPrefix)
      .all()
      .start();
    await Record.add(PersonWithLocalAndPrefix, person.data);
    console.log(events);

    events.forEach(evt => {
      expect(evt.localPath).to.equal(
        `${person.META.localPrefix}/${person.META.localModelName ||
          person.pluralName}`
      );
    });
  });

  it("Watching a Record uses localModelName for localPath", async () => {
    FireModel.defaultDb = await DB.connect({ mocking: true });
    Watch.reset();
    const personId = (await Mock(PersonWithLocalAndPrefix).generate(1)).pop()
      .id;
    const person = await Record.get(PersonWithLocalAndPrefix, personId);
    const events: IDictionary[] = [];
    FireModel.dispatch = async evt => {
      events.push(evt);
    };
    await Watch.record(PersonWithLocalAndPrefix, personId).start();
    await Record.add(PersonWithLocalAndPrefix, person.data);
    events.forEach(evt => {
      expect(evt.localPath).to.equal(
        `${person.META.localPrefix}/${person.META.localModelName}`
      );
    });

    const eventTypes = Array.from(new Set(events.map(e => e.type)));

    const expectedTypes = [
      FmEvents.RECORD_ADDED_LOCALLY,
      FmEvents.RECORD_ADDED_CONFIRMATION,
      FmEvents.WATCHER_STARTING,
      FmEvents.WATCHER_STARTED,
      FmEvents.RECORD_CHANGED // Record Listeners can't distinguish between ADD and UPDATE
    ];
    expectedTypes.forEach(e => {
      expect(eventTypes).to.include(e);
    });
  });
});

describe("Watch.list(XXX).ids()", () => {
  it("WatchList instantiated with ids() method", async () => {
    const wl = Watch.list(Person).ids("1234", "4567", "8989");
    expect(wl).to.be.instanceOf(WatchList);
    expect((wl as any)._underlyingRecordWatchers).to.have.lengthOf(3);
  });

  it("Starting WatchList only has a single and appropriate entry in watcher pool", async () => {
    const wl = Watch.list(Person).ids("1234", "4567", "8989");
    FireModel.dispatch = () => undefined;
    FireModel.defaultDb = await DB.connect({ mocking: true });
    const wId = await wl.start();
    const pool = getWatcherPool();
    expect(Object.keys(pool)).to.be.lengthOf(1);
    expect(Object.keys(pool)).includes(wId.watcherId);
    expect(wId.query).is.an("array");
    expect(wId.watcherPaths).is.an("array");
  });

  it('An event, when encountered, is correctly associated with the "list of records" watcher', async () => {
    FireModel.defaultDb = await DB.connect({ mocking: true });
    const events: Array<IFmEvent<Person>> = [];
    const cb = async (event: IFmEvent<Person>) => {
      events.push(event);
    };
    const watcher = await Watch.list(Person)
      .ids("1234", "4567")
      .dispatch(cb)
      .start();

    await Record.add(Person, {
      id: "1234",
      name: "Peggy Sue",
      age: 14
    });
    await Record.add(Person, {
      id: "4567",
      name: "Johnny Rotten",
      age: 65
    });
    await Record.add(Person, {
      id: "who-cares",
      name: "John Smith",
      age: 35
    });

    const recordsChanged = events.filter(
      e => e.type === FmEvents.RECORD_CHANGED
    );
    const recordIdsChanged = recordsChanged.map(i => i.key);
    expect(recordsChanged).lengthOf(2);

    recordsChanged.forEach(i => {
      expect(i.watcherSource).to.equal("list-of-records");
      expect(i.dbPath).to.be.a("string");
      expect(i.query)
        .to.be.an("array")
        .and.to.have.length(2);
      expect((i.query as SerializedQuery[])[0]).to.be.instanceOf(
        SerializedQuery
      );
    });

    expect(recordIdsChanged).includes("1234");
    expect(recordIdsChanged).includes("4567");
    expect(recordIdsChanged).does.not.include("who-cares");
  });

  it("The Watch.list(xyz).ids(...) works when the model has a composite key", async () => {
    FireModel.defaultDb = await DB.connect({ mocking: true });
    const events: Array<IFmEvent<Person>> = [];
    const cb = async (event: IFmEvent<Person>) => {
      events.push(event);
    };
    const watcher = Watch.list(DeeperPerson);
    watcher
      .ids(
        { id: "1234", group: "primary", subGroup: "foo" },
        { id: "4567", group: "secondary", subGroup: "bar" }
      )
      .dispatch(cb);

    await watcher.start();

    await Record.add(DeeperPerson, {
      id: "1234",
      group: "primary",
      subGroup: "foo",
      name: {
        first: "bob",
        last: "marley"
      },
      age: 65
    });

    await Record.add(DeeperPerson, {
      id: "4567",
      group: "secondary",
      subGroup: "bar",
      name: {
        first: "chris",
        last: "christy"
      },
      age: 55
    });

    const recordsChanged = events.filter(
      e => e.type === FmEvents.RECORD_CHANGED
    );

    recordsChanged.forEach(i => {
      expect(i.watcherSource).to.equal("list-of-records");
      expect(i.dbPath).to.be.a("string");
      expect(i.query)
        .to.be.an("array")
        .and.to.have.length(2);
      expect((i.query as SerializedQuery[])[0]).to.be.instanceOf(
        SerializedQuery
      );
    });
  });
});

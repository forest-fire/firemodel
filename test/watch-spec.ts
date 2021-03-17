import {
  FireModel,
  FmEvents,
  IFmLocalEvent,
  IFmWatchEvent,
  IReduxAction,
  Mock,
  Record,
  Watch,
  WatchList,
  getWatcherPool,
} from "@/index";
import { IDictionary, wait } from "common-types";
import { IAbstractedDatabase, RealTimeAdmin } from "universal-fire";

import { BaseSerializer } from "@forest-fire/serialized-query";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";
import { Person } from "./testing/Person";
import { PersonWithLocalAndPrefix } from "./testing/PersonWithLocalAndPrefix";
import { setupEnv } from "./testing/helpers";

setupEnv();

describe("Watch →", () => {
  let realDB: IAbstractedDatabase;
  beforeAll(async () => {
    realDB = await RealTimeAdmin.connect();
    FireModel.defaultDb = realDB;
  });

  afterEach(async () => {
    Watch.stop();
  });

  it("Watching a Record gives back a hashCode which can be looked up", async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
    const { watcherId } = await Watch.record(Person, "12345")
      .dispatch(async () => "")
      .start();
    expect(watcherId).toBeString();

    expect(Watch.lookup(watcherId)).toBeObject();
    expect(Watch.lookup(watcherId)).toHaveProperty("eventFamily");
    expect(Watch.lookup(watcherId)).toHaveProperty("query");
    expect(Watch.lookup(watcherId)).toHaveProperty("createdAt");
  });

  it("Watching CRUD actions on Record", async () => {
    FireModel.defaultDb = realDB;
    const events: IReduxAction[] = [];
    const cb = async (event: IReduxAction) => {
      events.push(event);
    };
    FireModel.dispatch = cb;
    const w = await Watch.record(Person, "1234").start();

    expect(Watch.inventory[w.watcherId]).toBeInstanceOf(Object);
    expect(Watch.inventory[w.watcherId].eventFamily).toBe("value");
    expect(Watch.inventory[w.watcherId].watcherPaths[0]).toBe(
      "authenticated/people/1234"
    );

    const r = await Record.get(Person, "1234");
    await r.remove();

    await FireModel.defaultDb.set("/authenticated/people/1234", {
      name: "Bob",
      age: 15,
    });
    await FireModel.defaultDb.update("/authenticated/people/1234", {
      age: 23,
    });

    const eventTypes = new Set(events.map((e) => e.type));
    expect(eventTypes.has(FmEvents.RECORD_CHANGED)).toBe(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_LOCALLY)).toBe(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED_CONFIRMATION)).toBe(true);
    expect(eventTypes.has(FmEvents.WATCHER_STARTING)).toBe(true);
    expect(eventTypes.has(FmEvents.WATCHER_STARTED)).toBe(true);
  });

  it("Watching CRUD actions on List", async () => {
    FireModel.defaultDb = realDB;
    const events: Array<IFmLocalEvent<Person>> = [];
    const cb = async (event: IFmLocalEvent<Person>) => {
      events.push(event);
    };
    await realDB.remove("/authenticated/people");
    Watch.list(Person).all().dispatch(cb).start();
    await Record.add(Person, {
      id: "1234",
      name: "Richard",
      age: 44,
    });
    await Record.add(Person, {
      id: "4567",
      name: "Carrie",
      age: 33,
    });

    await wait(500);
    // Initial response is to bring in all records
    let eventTypes = new Set(events.map((e) => e.type));

    expect(eventTypes.has(FmEvents.WATCHER_STARTING));
    expect(eventTypes.has(FmEvents.WATCHER_STARTED));
    expect(eventTypes.has(FmEvents.RECORD_ADDED));
    // Now we'll do some more CRUD activities
    await FireModel.defaultDb.set("/authenticated/people/1234", {
      name: "Bob",
      age: 15,
    });
    await FireModel.defaultDb.remove("/authenticated/people/1234");
    await FireModel.defaultDb.update("/authenticated/people/4567", {
      age: 88,
    });
    eventTypes = new Set(events.map((e) => e.type));
    expect(eventTypes.has(FmEvents.RECORD_CHANGED)).toBe(true);
    expect(eventTypes.has(FmEvents.RECORD_REMOVED)).toBe(true);
    expect(eventTypes.has(FmEvents.RECORD_ADDED)).toBe(true);
  });

  it("start() increases watcher count, stop() decreases it", async () => {
    Watch.reset();
    FireModel.dispatch = async () => "";
    expect(Watch.watchCount).toBe(0);
    const { watcherId: hc1 } = await Watch.record(Person, "989898").start();
    const { watcherId: hc2 } = await Watch.record(Person, "45645645").start();
    expect(Watch.watchCount).toBe(2);
    Watch.stop(hc1);
    expect(Watch.watchCount).toBe(1);
    expect(Watch.lookup(hc2)).toBeInstanceOf(Object);
    try {
      Watch.lookup(hc1);
      throw new Error("looking up an invalid hashcode should produce error!");
    } catch (e) {
      expect(e.name).toBe("FireModel::InvalidHashcode");
    }
  });

  it("Watching a List uses pluralName for localPath unless localModelName is set", async () => {
    Watch.reset();
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
    const personId = (await Mock(PersonWithLocalAndPrefix).generate(1)).pop()
      .id;
    const person = await Record.get(PersonWithLocalAndPrefix, personId);

    const events: IDictionary[] = [];
    FireModel.dispatch = async (evt) => {
      events.push(evt);
    };
    await Watch.list(PersonWithLocalAndPrefix).all().start();
    await Record.add(PersonWithLocalAndPrefix, person.data);

    events.forEach((evt) => {
      expect(evt.localPath).toBe(
        `${person.META.localPrefix}/${
          person.META.localModelName || person.pluralName
        }`
      );
    });
  });

  it("Watching a Record uses localModelName for localPath", async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
    Watch.reset();
    const personId = (await Mock(PersonWithLocalAndPrefix).generate(1)).pop()
      .id;
    const person = await Record.get(PersonWithLocalAndPrefix, personId);
    const events: IDictionary[] = [];
    FireModel.dispatch = async (evt) => {
      events.push(evt);
    };
    await Watch.record(PersonWithLocalAndPrefix, personId).start();
    await Record.add(PersonWithLocalAndPrefix, person.data);
    events.forEach((evt) => {
      expect(evt.localPath).toBe(
        `${person.META.localPrefix}/${person.META.localModelName}`
      );
    });

    const eventTypes = Array.from(new Set(events.map((e) => e.type)));

    const expectedTypes = [
      FmEvents.RECORD_ADDED_LOCALLY,
      FmEvents.RECORD_ADDED_CONFIRMATION,
      FmEvents.WATCHER_STARTING,
      FmEvents.WATCHER_STARTED,
      FmEvents.RECORD_CHANGED, // Record Listeners can't distinguish between ADD and UPDATE
    ];
    expectedTypes.forEach((e) => {
      expect(eventTypes).toEqual(expect.arrayContaining([e]));
    });
  });
});

describe("Watch.list(XXX).ids()", () => {
  it("WatchList instantiated with ids() method", async () => {
    const wl = Watch.list(Person).ids("1234", "4567", "8989");
    expect(wl).toBeInstanceOf(WatchList);
    expect((wl as any)._underlyingRecordWatchers).toHaveLength(3);
  });

  it("Starting WatchList only has a single and appropriate entry in watcher pool", async () => {
    const wl = Watch.list(Person).ids("1234", "4567", "8989");
    FireModel.dispatch = () => undefined;
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
    const wId = await wl.start();
    const pool = getWatcherPool();
    expect(Object.keys(pool)).toHaveLength(1);
    expect(Object.keys(pool)).toEqual(expect.arrayContaining([wId.watcherId]));
    expect(wId.query).toBeInstanceOf(Array);
    expect(wId.watcherPaths).toBeInstanceOf(Array);
  });

  it('An event, when encountered, is correctly associated with the "list of records" watcher', async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
    const events: Array<IFmWatchEvent<Person>> = [];
    const cb = async (event: IFmWatchEvent<Person>) => {
      events.push(event);
    };
    const watcher = await Watch.list(Person)
      .ids("1234", "4567")
      .dispatch(cb)
      .start();

    await Record.add(Person, {
      id: "1234",
      name: "Peggy Sue",
      age: 14,
    });
    await Record.add(Person, {
      id: "4567",
      name: "Johnny Rotten",
      age: 65,
    });
    await Record.add(Person, {
      id: "who-cares",
      name: "John Smith",
      age: 35,
    });

    const recordsChanged = events.filter(
      (e) => e.type === FmEvents.RECORD_CHANGED
    );
    const recordIdsChanged = recordsChanged.map((i) => i.key);

    // two events when the watcher is turned on;
    // two more when change takes place on a watched path
    expect(recordsChanged).toHaveLength(4);

    recordsChanged.forEach((i) => {
      expect(i.watcherSource).toBe("list-of-records");
      expect(i.dbPath).toBeString();
      expect(i.query).toBeInstanceOf(Array);
      expect(i.query).toHaveLength(2);
      expect((i.query as BaseSerializer[])[0]).toBeInstanceOf(BaseSerializer);
    });

    expect(recordIdsChanged).toEqual(expect.arrayContaining(["1234"]));
    expect(recordIdsChanged).toEqual(expect.arrayContaining(["4567"]));
    expect(recordIdsChanged).toEqual(expect.not.arrayContaining(["who-cares"]));
  });

  it("The Watch.list(xyz).ids(...) works when the model has a composite key", async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({
      mocking: true,
    });
    const events: Array<IFmWatchEvent<Person>> = [];
    const cb = async (event: IFmWatchEvent<Person>) => {
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
        last: "marley",
      },
      age: 65,
    });

    await Record.add(DeeperPerson, {
      id: "4567",
      group: "secondary",
      subGroup: "bar",
      name: {
        first: "chris",
        last: "christy",
      },
      age: 55,
    });

    const recordsChanged = events.filter(
      (e) => e.type === FmEvents.RECORD_CHANGED
    );

    recordsChanged.forEach((i) => {
      expect(i.watcherSource).toBe("list-of-records");
      expect(i.dbPath).toBeString();
      expect(i.query).toBeInstanceOf(Array);
      expect(i.query).toHaveLength(2);
      expect((i.query as BaseSerializer[])[0]).toBeInstanceOf(BaseSerializer);
    });
  });
});

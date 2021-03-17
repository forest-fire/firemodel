import "reflect-metadata";

import * as helpers from "./testing/helpers";

import {
  FmEvents,
  IFmLocalEvent,
  IReduxAction,
  List,
  Record,
  Watch,
} from "../src";
import { IDictionary, wait } from "common-types";
import { IAbstractedDatabase, IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { FancyPerson } from "./testing/FancyPerson";
import { FireModel } from "@/index";
import { Person } from "./testing/Person";
import { pathJoin } from "@/util";

helpers.setupEnv();

describe("Tests using REAL db =>�", () => {
  let db: IAbstractedDatabase;
  beforeAll(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });
  afterAll(async () => {
    try {
      await db.remove(`/authenticated/fancyPeople`);
    } catch (e) {
      //
    }
  });
  it("List.since() works", async () => {
    try {
      await Record.add(Person, {
        name: "Carl Yazstrimski",
        age: 99,
      });
      const timestamp = new Date().getTime();
      await helpers.wait(50);
      await Record.add(Person, {
        name: "Bob Geldof",
        age: 65,
      });
      const since = List.since(Person, timestamp);

      // cleanup
      await db.remove("/authenticated");
    } catch (e) {
      throw e;
    }
  });

  it("Adding a record to the database creates the appropriate number of dispatch events", async () => {
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => {
      events.push(e);
    };
    const w = await Watch.list(FancyPerson)
      .all()
      .start({ name: "my-test-watcher" });

    const eventTypes: string[] = Array.from(new Set(events.map((e) => e.type)));

    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.WATCHER_STARTING])
    );
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.WATCHER_STARTED])
    );
    expect(eventTypes).toEqual(
      expect.not.arrayContaining([FmEvents.RECORD_ADDED])
    );
    expect(eventTypes).toEqual(
      expect.not.arrayContaining([FmEvents.RECORD_ADDED_LOCALLY])
    );

    await Record.add(FancyPerson, {
      name: "Bob the Builder",
    });
    const eventTypes2: string[] = Array.from(
      new Set(events.map((e) => e.type))
    );

    expect(eventTypes2).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED])
    );
  });

  it("Updating a record with duplicate values does not fire event watcher event", async () => {
    const events: IDictionary[] = [];
    const bob = await Record.add(FancyPerson, {
      name: "Bob Marley",
    });
    const w = await Watch.list(FancyPerson)
      .all()
      .start({ name: "my-update-watcher" });
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);
    await Record.update(FancyPerson, bob.id, { name: "Bob Marley" });
    await wait(50);
    const eventTypes: string[] = Array.from(new Set(events.map((e) => e.type)));

    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.RECORD_CHANGED_LOCALLY])
    );
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.RECORD_CHANGED_CONFIRMATION])
    );
    expect(eventTypes).toEqual(
      expect.not.arrayContaining([FmEvents.RECORD_CHANGED])
    );
  });

  it("Detects changes at various nested levels of the watch/listener", async () => {
    let events: Array<IFmLocalEvent<FancyPerson>> = [];
    const jack = await Record.add(FancyPerson, {
      name: "Jack Johnson",
    });
    FireModel.dispatch = async (e: IFmLocalEvent<FancyPerson>) =>
      events.push(e);
    const w = await Watch.list(FancyPerson)
      .all()
      .start({ name: "path-depth-test" });
    // deep path set
    const deepPath = pathJoin(jack.dbPath, "/favorite/sports/basketball");
    await db.set(deepPath, true);
    const eventTypes: string[] = Array.from(new Set(events.map((e) => e.type)));
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.WATCHER_STARTING])
    );
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.WATCHER_STARTED])
    );
    expect(eventTypes).toEqual(expect.arrayContaining([FmEvents.RECORD_ADDED]));
    const added = events
      .filter((e) => e.type === FmEvents.RECORD_ADDED)
      .reverse()
      .pop();
    expect(added.key).toBe(jack.id);
    events = [];
    // child path updated directly
    const childPath = pathJoin(jack.dbPath, "/favorite");
    await db.set(childPath, "steelers");
    expect(events).toHaveLength(1);
    const updated = events.pop();
    expect(updated.type).toBe(FmEvents.RECORD_CHANGED);
    expect(updated.key).toBe(jack.id);
    events = [];
    // full update of record
    await db.set(jack.dbPath, {
      name: jack.data.name,
      favorite: "red sox",
    });
    expect(events).toHaveLength(1);
    const replaced = events.pop();
    expect(replaced.type).toBe(FmEvents.RECORD_CHANGED);
    expect(replaced.key).toBe(jack.id);
  });

  it.skip("value listener returns correct key and value", async () => {
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);
    const w = await Watch.record(FancyPerson, "abcd").start({
      name: "value-listener",
    });

    const person = await Record.add(FancyPerson, {
      id: "abcd",
      name: "Jim Jones",
    });

    const addedLocally = events.filter(
      (e) => e.type === FmEvents.RECORD_ADDED_LOCALLY
    );

    expect(addedLocally).toHaveLength(1);
    expect(addedLocally[0].key).toBe(person.id);

    const confirmed = events.filter(
      (e) => e.type === FmEvents.RECORD_ADDED_CONFIRMATION
    );
    expect(confirmed).toHaveLength(1);
    expect(confirmed[0].key).toBe(person.id);
  });
});

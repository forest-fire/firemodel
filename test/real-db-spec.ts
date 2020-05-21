// tslint:disable:no-implicit-dependencies
import {
  Record,
  List,
  Watch,
  FmEvents,
  IFmLocalEvent,
  IReduxAction,
} from "../src";
import { DB, SDK } from "universal-fire";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/Person";
import * as helpers from "./testing/helpers";
import { FireModel } from "../src/FireModel";
import { IDictionary, wait, pathJoin } from "common-types";
import { FancyPerson } from "./testing/FancyPerson";

helpers.setupEnv();

describe("Tests using REAL db =>�", () => {
  let db: ISdkClient;
  before(async () => {
    db = await DB.connect(SDK.RealTimeAdmin);
    FireModel.defaultDb = db;
  });
  after(async () => {
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

    expect(eventTypes).to.include(FmEvents.WATCHER_STARTING);
    expect(eventTypes).to.include(FmEvents.WATCHER_STARTED);
    expect(eventTypes).to.not.include(FmEvents.RECORD_ADDED);
    expect(eventTypes).to.not.include(FmEvents.RECORD_ADDED_LOCALLY);

    await Record.add(FancyPerson, {
      name: "Bob the Builder",
    });
    const eventTypes2: string[] = Array.from(
      new Set(events.map((e) => e.type))
    );

    expect(eventTypes2).to.include(FmEvents.RECORD_ADDED);
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

    expect(eventTypes).to.include(FmEvents.RECORD_CHANGED_LOCALLY);
    expect(eventTypes).to.include(FmEvents.RECORD_CHANGED_CONFIRMATION);
    expect(eventTypes).to.not.include(FmEvents.RECORD_CHANGED);
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
    expect(eventTypes).to.include(FmEvents.WATCHER_STARTING);
    expect(eventTypes).to.include(FmEvents.WATCHER_STARTED);
    expect(
      eventTypes,
      `RECORD_ADDED should have been included [${eventTypes}]`
    ).to.include(FmEvents.RECORD_ADDED);
    const added = events.filter((e) => e.type === FmEvents.RECORD_ADDED).pop();
    expect(added.key).to.equal(jack.id);
    events = [];
    // child path updated directly
    const childPath = pathJoin(jack.dbPath, "/favorite");
    await db.set(childPath, "steelers");
    expect(events).to.have.lengthOf(1);
    const updated = events.pop();
    expect(updated.type).to.equal(FmEvents.RECORD_CHANGED);
    expect(updated.key).to.equal(jack.id);
    events = [];
    // full update of record
    await db.set(jack.dbPath, {
      name: jack.data.name,
      favorite: "red sox",
    });
    expect(events).to.have.lengthOf(1);
    const replaced = events.pop();
    expect(replaced.type).to.equal(FmEvents.RECORD_CHANGED);
    expect(replaced.key).to.equal(jack.id);
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
    console.log(addedLocally);

    expect(addedLocally).to.have.lengthOf(1);
    expect(addedLocally[0].key).to.equal(person.id);

    const confirmed = events.filter(
      (e) => e.type === FmEvents.RECORD_ADDED_CONFIRMATION
    );
    expect(confirmed).to.have.lengthOf(1);
    expect(confirmed[0].key).to.equal(person.id);
  });
});

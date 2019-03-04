// tslint:disable:no-implicit-dependencies
import { Record } from "../src/Record";
import { DB } from "abstracted-client";
import { DB as Admin } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import { FireModel } from "../src/FireModel";
import { Watch } from "../src/Watch";
import { Person } from "./testing/person";
import { setupEnv } from "./testing/helpers";
import { IReduxAction } from "../src/VuexWrapper";
import { FMEvents } from "../src/state-mgmt";
import { wait } from "common-types";

setupEnv();

describe("Watch →", () => {
  let realDB: Admin;
  before(async () => {
    realDB = await Admin.connect();
  });

  it("Watching a Record gives back a hashCode which can be looked up", async () => {
    FireModel.defaultDb = await DB.connect({ mocking: true });
    const { watchId } = Watch.record(Person, "12345")
      .dispatch(() => "")
      .start();
    expect(watchId).to.be.a("string");

    expect(Watch.lookup(watchId)).to.be.an("object");
    expect(Watch.lookup(watchId)).to.haveOwnProperty("eventType");
    expect(Watch.lookup(watchId)).to.haveOwnProperty("query");
    expect(Watch.lookup(watchId)).to.haveOwnProperty("createdAt");
  });

  it("Watching CRUD actions on Record", async () => {
    FireModel.defaultDb = realDB;
    const events: IReduxAction[] = [];
    const cb = (event: IReduxAction) => {
      events.push(event);
    };

    Watch.record(Person, "1234")
      .dispatch(cb)
      .start();

    await FireModel.defaultDb.remove("/authenticated/people/1234");
    await FireModel.defaultDb.set("/authenticated/people/1234", {
      name: "Bob",
      age: 15
    });
    await FireModel.defaultDb.update("/authenticated/people/1234", {
      age: 23
    });
    const eventTypes = new Set(events.map(e => e.type));

    expect(eventTypes.size).to.equal(2);
    expect(eventTypes.has(FMEvents.RECORD_CHANGED)).to.equal(true);
    expect(eventTypes.has(FMEvents.RECORD_REMOVED)).to.equal(true);
  });

  it("Watching CRUD actions on List", async () => {
    FireModel.defaultDb = realDB;
    const events: IReduxAction[] = [];
    const cb = (event: IReduxAction) => {
      events.push(event);
    };
    await realDB.remove("/authenticated/people");
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

    Watch.list(Person)
      .all()
      .dispatch(cb)
      .start();
    await wait(500);
    // Initial response is to bring in all records
    // expect(events).to.have.lengthOf(2);
    let eventTypes = new Set(events.map(e => e.type));

    expect(eventTypes.size).to.equal(1);
    expect(eventTypes.has(FMEvents.RECORD_ADDED));
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
    expect(eventTypes.has(FMEvents.RECORD_CHANGED)).to.equal(true);
    expect(eventTypes.has(FMEvents.RECORD_REMOVED)).to.equal(true);
    expect(eventTypes.has(FMEvents.RECORD_ADDED)).to.equal(true);
  });

  it("start() increases watcher count, stop() decreases it", async () => {
    Watch.reset();
    FireModel.dispatch = () => "";
    expect(Watch.watchCount).to.equal(0);
    const { watchId: hc1 } = Watch.record(Person, "989898").start();
    const { watchId: hc2 } = Watch.record(Person, "45645645").start();
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

  // Watch.list(Person).since();
});

// tslint:disable:no-implicit-dependencies
import { Record, IFmRecordEvent } from "../src";
import * as chai from "chai";
import { Person } from "./testing/person";
import { PersonWithLocal } from "./testing/PersonWithLocal";
import { PersonWithLocalAndPrefix } from "./testing/PersonWithLocalAndPrefix";
import { IMultiPathUpdates, FireModel } from "../src/FireModel";
import { FmEvents } from "../src/state-mgmt";
import { DB } from "abstracted-admin";
import { wait } from "./testing/helpers";
import { IVuexDispatch, VeuxWrapper } from "../src/VuexWrapper";
const expect = chai.expect;

describe("Dispatch →", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
    Record.defaultDb = db;
    Record.dispatch = null;
  });
  it("_getPaths() decomposes the update into an array of discrete update paths", async () => {
    const person = Record.create(Person);
    (person as any)._data.id = "12345"; // cheating a bit here
    const lastUpdated = new Date().getTime();
    const updated = {
      name: "Roger Rabbit",
      lastUpdated
    };
    const result: IMultiPathUpdates[] = (person as any)._getPaths(updated);

    // expect(result.length).to.equal(2);
    result.map(i => {
      expect(i).to.haveOwnProperty("path");
      expect(i).to.haveOwnProperty("value");
      if (i.path.indexOf("lastUpdated") !== -1) {
        expect(i.value).to.equal(lastUpdated);
      } else {
        expect(i.value).to.equal("Roger Rabbit");
      }
    });
  });

  it("set() immediately changes value on Record", async () => {
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18
    });

    person.set("name", "Carol");
    expect(person.isDirty).to.equal(true);
    expect(person.get("name")).to.equal("Carol");
    await wait(15);
    expect(person.isDirty).to.equal(false);
  });

  it("waiting for set() fires the appropriate Redux event; and inProgress is set", async () => {
    const events: Array<IFmRecordEvent<Person>> = [];
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18
    });
    Record.dispatch = (e: IFmRecordEvent<Person>) => events.push(e);

    await person.set("name", "Carol");
    expect(person.get("name")).to.equal("Carol"); // local change took place
    expect(events.length).to.equal(2); // two phase commit
    expect(person.isDirty).to.equal(false); // value  back to false

    // 1st EVENT (local change)
    let event = events[0];

    expect(event.type).to.equal(FmEvents.RECORD_CHANGED_LOCALLY);
    expect(event.value.name).to.equal("Carol");

    // 2nd EVENT
    event = events[1];
    expect(event.type).to.equal(FmEvents.RECORD_CHANGED_CONFIRMATION);
    expect(event.value).to.be.an("object");
    expect(event.value.name).to.equal("Carol");
    expect(event.value.age).to.equal(18);
  });

  it("VuexWrapper converts calling structure to what Vuex expects", async () => {
    const events: Array<IFmRecordEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch = (type, payload: any) => {
      types.add(type);
      events.push({ ...payload, ...{ type } });
    };
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12
    });
    await person.update({
      age: 25
    });
    expect(events).to.have.lengthOf(4);
    expect(types.size).to.equal(2);
  });

  it("By default the localPath is the singular modelName", async () => {
    const events: Array<IFmRecordEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch = (type, payload: any) => {
      types.add(type);
      events.push({ ...payload, ...{ type } });
    };
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12
    });

    events.forEach(event => expect(event.localPath).to.equal(event.modelName));
  });

  it("When @model decorator and setting localModelName we can override the localPath", async () => {
    const events: Array<IFmRecordEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch = (type, payload: any) => {
      types.add(type);
      events.push({ ...payload, ...{ type } });
    };
    const person = await Record.add(PersonWithLocal, {
      name: "Jane",
      age: 18
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12
    });

    events.forEach(event =>
      expect(event.localPath).to.equal(person.META.localModelName)
    );
  });

  it("The when dispatching events without a listener the source is 'unknown'", async () => {
    const events: Array<IFmRecordEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch = (type, payload: any) => {
      types.add(type);
      events.push({ ...payload, ...{ type } });
    };
    const person = await Record.add(PersonWithLocalAndPrefix, {
      name: "Jane",
      age: 18
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12
    });

    events.forEach(event => expect(event.watcherSource).to.equal("unknown"));
  });
});

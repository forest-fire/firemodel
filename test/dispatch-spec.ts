// tslint:disable:no-implicit-dependencies
import { Record, IFmWatchEvent, IFmChangedProperties } from "../src";
import * as chai from "chai";
import { Person } from "./testing/Person";
import { PersonWithLocal } from "./testing/PersonWithLocal";
import { PersonWithLocalAndPrefix } from "./testing/PersonWithLocalAndPrefix";
import { IMultiPathUpdates, FireModel } from "../src/FireModel";
import { FmEvents } from "../src/state-mgmt";
// import { DB, SDK, IAbstractedDatabase } from "universal-fire";
import { wait } from "./testing/helpers";
import { IVuexDispatch, VeuxWrapper } from "../src/state-mgmt/VuexWrapper";
import { compareHashes, withoutMetaOrPrivate } from "../src/util";
const expect = chai.expect;

describe("Dispatch →", () => {
  let db: IAbstractedDatabase;
  beforeEach(async () => {
    db = await DB.connect(SDK.RealTimeAdmin, { mocking: true });
    Record.defaultDb = db;
    Record.dispatch = null;
  });

  it("_getPaths() decomposes the changes into an array of discrete update paths", async () => {
    const person = await Record.add(Person, {
      name: "Bob",
      gender: "male",
    });

    const p2 = await Record.createWith(Person, {
      id: person.id,
      name: "Bob Marley",
      age: 55,
      gender: null,
    });
    const validProperties = person.META.properties.map(
      (i) => i.property
    ) as Array<keyof Person & string>;

    const deltas = compareHashes(p2.data, person.data, validProperties);
    const result: IFmChangedProperties<Person> = (person as any)._getPaths(
      p2,
      deltas
    );

    expect(deltas.added).to.include("age");
    expect(deltas.changed).to.include("name");
    expect(deltas.removed).to.include("gender");
    Object.keys(result).map((key: keyof typeof result) => {
      if (key.includes("company")) {
        expect(result[key]).to.equal(null);
      }

      if (key.includes("age")) {
        expect(result[key]).to.equal(55);
      }

      if (key.includes("name")) {
        expect(result[key]).to.equal("Bob Marley");
      }
    });
  });

  it("set() immediately changes value on Record", async () => {
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18,
    });

    person.set("name", "Carol");
    expect(person.isDirty).to.equal(true);
    expect(person.get("name")).to.equal("Carol");
    await wait(15);
    expect(person.isDirty).to.equal(false);
  });

  it("waiting for set() fires the appropriate Redux event; and inProgress is set", async () => {
    const events: Array<IFmWatchEvent<Person>> = [];
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18,
    });
    Record.dispatch = async (e: IFmWatchEvent<Person>) => events.push(e);

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
    const events: Array<IFmWatchEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch = async (type, payload: any) => {
      types.add(type);
      events.push({ ...payload, ...{ type } });
    };
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18,
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12,
    });
    await person.update({
      age: 25,
    });
    expect(events).to.have.lengthOf(4);
    expect(types.size).to.equal(2);
  });

  it("By default the localPath is the singular modelName", async () => {
    const events: Array<IFmWatchEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch = async (type, payload: any) => {
      types.add(type);
      events.push({ ...payload, ...{ type } });
    };
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18,
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12,
    });

    events.forEach((event) =>
      expect(event.localPath).to.equal(event.modelName)
    );
  });

  it("When @model decorator and setting localModelName we can override the localPath", async () => {
    const events: Array<IFmWatchEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch<IFmWatchEvent<Person>> = async (
      type,
      payload
    ) => {
      types.add(type);
      events.push({ ...payload, ...{ type } } as any);
    };
    const person = await Record.add(PersonWithLocal, {
      name: "Jane",
      age: 18,
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12,
    });

    events.forEach((event) =>
      expect(
        event.localPath,
        `The localPath [ ${event.localPath} ] should equal the model's localModelName [ ${person.META.localModelName}`
      )
    );
  });

  it("The when dispatching events without a listener the source is 'unknown'", async () => {
    const events: Array<IFmWatchEvent<Person>> = [];
    const types = new Set<string>();
    const vueDispatch: IVuexDispatch = async (type, payload: any) => {
      types.add(type);
      events.push({ ...payload, ...{ type } });
    };
    const person = await Record.add(PersonWithLocalAndPrefix, {
      name: "Jane",
      age: 18,
    });
    Record.dispatch = VeuxWrapper(vueDispatch);
    await person.update({
      age: 12,
    });
    console.log(events);

    events.forEach((event) => expect(event.watcherSource).to.equal("unknown"));
  });
});

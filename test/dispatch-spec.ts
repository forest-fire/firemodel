import { FireModel, IMultiPathUpdates } from "../src/FireModel";
// tslint:disable:no-implicit-dependencies
import { IFmChangedProperties, IFmWatchEvent, Record } from "../src";
import { IRealTimeAdmin, RealTimeAdmin } from "universal-fire";
import { IVuexDispatch, VeuxWrapper } from "../src/state-mgmt/VuexWrapper";
import { compareHashes, withoutMetaOrPrivate } from "../src/util";

import { FmEvents } from "../src/state-mgmt";
import { Person } from "./testing/Person";
import { PersonWithLocal } from "./testing/PersonWithLocal";
import { PersonWithLocalAndPrefix } from "./testing/PersonWithLocalAndPrefix";
import { wait } from "./testing/helpers";

describe("Dispatch →", () => {
  let db: IRealTimeAdmin;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    Record.defaultDb = db;
    Record.dispatch = null;
  });

  it(
    "_getPaths() decomposes the changes into an array of discrete update paths",
    async () => {
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

      expect(deltas.added).toEqual(expect.arrayContaining(["age"]));
      expect(deltas.changed).toEqual(expect.arrayContaining(["name"]));
      expect(deltas.removed).toEqual(expect.arrayContaining(["gender"]));
      Object.keys(result).map((key: keyof typeof result) => {
        if (key.includes("company")) {
          expect(result[key]).toBe(null);
        }

        if (key.includes("age")) {
          expect(result[key]).toBe(55);
        }

        if (key.includes("name")) {
          expect(result[key]).toBe("Bob Marley");
        }
      });
    }
  );

  it("set() immediately changes value on Record", async () => {
    const person = await Record.add(Person, {
      name: "Jane",
      age: 18,
    });

    person.set("name", "Carol");
    expect(person.isDirty).toBe(true);
    expect(person.get("name")).toBe("Carol");
    await wait(15);
    expect(person.isDirty).toBe(false);
  });

  it(
    "waiting for set() fires the appropriate Redux event; and inProgress is set",
    async () => {
      const events: Array<IFmWatchEvent<Person>> = [];
      const person = await Record.add(Person, {
        name: "Jane",
        age: 18,
      });
      Record.dispatch = async (e: IFmWatchEvent<Person>) => events.push(e);

      await person.set("name", "Carol");
      expect(person.get("name")).toBe("Carol"); // local change took place
      expect(events.length).toBe(2); // two phase commit
      expect(person.isDirty).toBe(false); // value  back to false

      // 1st EVENT (local change)
      let event = events[0];

      expect(event.type).toBe(FmEvents.RECORD_CHANGED_LOCALLY);
      expect(event.value.name).toBe("Carol");

      // 2nd EVENT
      event = events[1];
      expect(event.type).toBe(FmEvents.RECORD_CHANGED_CONFIRMATION);
      expect(event.value).toBeInstanceOf("object");
      expect(event.value.name).toBe("Carol");
      expect(event.value.age).toBe(18);
    }
  );

  it(
    "VuexWrapper converts calling structure to what Vuex expects",
    async () => {
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
      expect(events).toHaveLength(4);
      expect(types.size).toBe(2);
    }
  );

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
      expect(event.localPath).toBe(event.modelName)
    );
  });

  it(
    "When @model decorator and setting localModelName we can override the localPath",
    async () => {
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
    }
  );

  it(
    "The when dispatching events without a listener the source is 'unknown'",
    async () => {
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

      events.forEach((event) => expect(event.watcherSource).toBe("unknown"));
    }
  );
});

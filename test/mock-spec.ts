import * as helpers from "./testing/helpers";

import {
  FireModel,
  FmEvents,
  IReduxAction,
  List,
  Model,
  Record,
  Watch,
  model,
  property,
} from "../src";
import { IDictionary, wait } from "common-types";
import { IAbstractedDatabase, IRealTimeAdmin, RealTimeAdmin } from "universal-fire";

import { Car } from "./testing/Car";
import { Company } from "./testing/Company";
import { FancyPerson } from "./testing/FancyPerson";
import { Mock as FireMock } from "firemock";
import { Mock } from "@/index";

helpers.setupEnv();
@model({})
export class SimplePerson extends Model {
  @property public name: string;
  @property public age: number;
  @property public phoneNumber: string;
}

describe("Mocking:", () => {
  let db: IAbstractedDatabase;
  let realDb: IAbstractedDatabase;
  beforeAll(async () => {
    // TODO: check why "realDb" is a mock DB
    realDb = await RealTimeAdmin.connect({ mocking: true });
  });
  afterAll(async () => {
    const fancy = Record.create(FancyPerson);
    try {
      await realDb.remove(fancy.dbOffset);
    } catch (e) {
      console.log(`Got error in cleanup: `, e.message);
    }
  });
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("FireMock.prepare() leads to immediate availability of faker library", async () => {
    const m = await FireMock.prepare();
    expect(m.faker).toBeObject();
    expect(m.faker.address.city).toBeInstanceOf(Function);
  });

  it("the auto-mock works for named properties", async () => {
    await Mock(SimplePerson, db).generate(10);
    const people = await List.all(SimplePerson);

    expect(people).toHaveLength(10);
    people.map((person) => {
      expect(person.age).toBeNumber();
      expect(person.age).toBeGreaterThan(0);
      expect(person.age).toBeLessThan(101);
    });
  });

  it("giving a @mock named hint corrects the typing of a named prop", async () => {
    const m = await Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);

    expect(people).toHaveLength(10);
    people.map((person) => {
      expect(person.otherPhone).toBeString();
      expect(/[\.\(-]/.test(person.otherPhone)).toBe(true);
    });
  });

  it("passing in a function to @mock produces expected results", async () => {
    await Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);
    expect(people).toHaveLength(10);
    people.map((person) => {
      expect(person.foobar).toBeString();
      expect(person.foobar).toContain("hello");
    });
  });

  it("using createRelationshipLinks() sets fake links to all relns", async () => {
    const numberOfFolks = 2;
    await Mock(FancyPerson, db)
      .createRelationshipLinks()
      .generate(numberOfFolks);

    const people = await List.all(FancyPerson);
    expect(people).toHaveLength(numberOfFolks);

    people.map((person) => {
      expect(person.employer).toBeString();
      expect(person.cars).toBeInstanceOf(Object);
    });
  });

  it("using followRelationshipLinks() sets links and adds those models", async () => {
    const numberOfFolks = 10;
    try {
      await Mock(FancyPerson, db)
        .followRelationshipLinks()
        .generate(numberOfFolks);
    } catch (e) {
      console.error(e.errors);
      throw e;
    }

    const people = await List.all(FancyPerson);
    const cars = await List.all(Car);
    const company = await List.all(Company);

    expect(cars.length).toBe(numberOfFolks * 2);
    expect(company.length).toBe(numberOfFolks);
    expect(people).toHaveLength(numberOfFolks * 5);

    const carIds = cars.map((car) => car.id);
    carIds.map((id) => people.filter((i) => i.id === id));

    const companyIds = company.map((c) => c.id);
    companyIds.map((id) => people.filter((i) => i.id === id));
  });

  it("using a specific config for createRelationshipLinks works as expected", async () => {
    jest.setTimeout(15000);
    const numberOfFolks = 25;
    await Mock(FancyPerson, db)
      .followRelationshipLinks({
        cars: [3, 5],
      })
      .generate(numberOfFolks);
    const people = await List.all(FancyPerson);

    expect(people).toHaveLength(numberOfFolks);
  });

  it("Adding a record fires local events as expected", async () => {
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);
    await Record.add(FancyPerson, {
      name: "Bob Barker",
    });

    const types = events.map((e) => e.type);

    expect(types).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_LOCALLY])
    );
    expect(types).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED_CONFIRMATION])
    );
  });

  it("Mocking data does not fire fire local events (RECORD_ADD_LOCALLY, RECORD_ADD_CONFIRMATION) to dispatch", async () => {
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);
    await Mock(FancyPerson).generate(10);
    expect(events).toHaveLength(0);
  });

  it("Adding a record with {silent: true} raises an error in real db", async () => {
    FireModel.defaultDb = realDb;
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);

    try {
      await Record.add(
        FancyPerson,
        {
          name: "Bob Barker",
        },
        { silent: true }
      );
    } catch (e) {
      expect(e.code).toBe("forbidden");
    }
  });

  it("Adding a record with a watcher fires both watcher event and LOCAL events [ real db ]", async () => {
    FireModel.defaultDb = realDb;
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);
    const w = await Watch.list(FancyPerson).all().start();

    // await Mock(FancyPerson).generate(1);
    await Record.add(FancyPerson, {
      name: "Bob Barker",
    });

    const eventTypes: Set<string> = new Set();
    events.forEach((e) => eventTypes.add(e.type));

    expect(Array.from(eventTypes)).toEqual(
      expect.arrayContaining([FmEvents.RECORD_ADDED])
    );
    expect(Array.from(eventTypes)).toEqual(
      expect.arrayContaining(["@firemodel/RECORD_ADDED_LOCALLY"])
    );
    expect(Array.from(eventTypes)).toEqual(
      expect.arrayContaining(["@firemodel/RECORD_ADDED_CONFIRMATION"])
    );
    const locally = events.find(
      (e) => e.type === FmEvents.RECORD_ADDED_LOCALLY
    );
    const confirm = events.find(
      (e) => e.type === FmEvents.RECORD_ADDED_CONFIRMATION
    );
    expect(locally).toHaveProperty("transactionId");
    expect(confirm).toHaveProperty("transactionId");
    expect(locally.transactionId).toBe(confirm.transactionId);
  });

  it("Mocking data does NOT fire watcher events but adding a record DOES [ mock db ]", async () => {
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => {
      events.push(e);
    };
    const w = await Watch.list(FancyPerson)
      .all()
      .start({ name: "my-test-watcher" });

    let eventTypes: Set<string> = new Set(events.map((e) => e.type));
    expect(Array.from(eventTypes)).toEqual(
      expect.not.arrayContaining([FmEvents.RECORD_ADDED])
    );

    await Mock(FancyPerson).generate(1);
    eventTypes = new Set(events.map((e) => e.type));

    expect(Array.from(eventTypes)).toContain(FmEvents.RECORD_ADDED);
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
});

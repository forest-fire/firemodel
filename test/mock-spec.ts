// tslint:disable:no-implicit-dependencies
import {
  Model,
  model,
  List,
  property,
  FireModel,
  Watch,
  Record,
  FmEvents,
  IReduxAction,
} from "../src";
import { DB, RealTimeAdmin } from "universal-fire";
import * as chai from "chai";
import { Mock } from "../src/Mock";
import { Mock as FireMock } from "firemock";
import { FancyPerson } from "./testing/FancyPerson";
import { Car } from "./testing/Car";
import { Company } from "./testing/Company";
import { IDictionary, wait } from "common-types";
import * as helpers from "./testing/helpers";
const expect = chai.expect;
helpers.setupEnv();
@model({})
export class SimplePerson extends Model {
  @property public name: string;
  @property public age: number;
  @property public phoneNumber: string;
}

describe("Mocking:", () => {
  let db: RealTimeAdmin;
  let realDb: RealTimeAdmin;
  before(async () => {
    realDb = await DB.connect(RealTimeAdmin, { mocking: true });
  });
  after(async () => {
    const fancy = Record.create(FancyPerson);
    try {
      await realDb.remove(fancy.dbOffset);
    } catch (e) {
      console.log(`Got error in cleanup: `, e.message);
    }
  });
  beforeEach(async () => {
    db = await DB.connect(RealTimeAdmin, { mocking: true });
    FireModel.defaultDb = db;
  });

  it("FireMock.prepare() leads to immediate availability of faker library", async () => {
    const m = await FireMock.prepare();
    expect(m.faker).is.a("object");
    expect(m.faker.address.city).is.a("function");
  });

  it("the auto-mock works for named properties", async () => {
    await Mock(SimplePerson, db).generate(10);
    const people = await List.all(SimplePerson);

    expect(people).to.have.lengthOf(10);
    people.map((person) => {
      expect(person.age).to.be.a("number").greaterThan(0).lessThan(101);
    });
  });

  it("giving a @mock named hint corrects the typing of a named prop", async () => {
    const m = await Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);

    expect(people).to.have.lengthOf(10);
    people.map((person) => {
      expect(person.otherPhone).to.be.a("string");
      expect(/[\.\(-]/.test(person.otherPhone)).to.equal(true);
    });
  });

  it("passing in a function to @mock produces expected results", async () => {
    await Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(10);
    people.map((person) => {
      expect(person.foobar).to.be.a("string");
      expect(person.foobar).to.contain("hello");
    });
  });

  it("using createRelationshipLinks() sets fake links to all relns", async () => {
    const numberOfFolks = 2;
    await Mock(FancyPerson, db)
      .createRelationshipLinks()
      .generate(numberOfFolks);

    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(numberOfFolks);

    people.map((person) => {
      expect(person.employer).to.be.a("string");
      expect(person.cars).to.be.an("object");
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

    expect(cars.length).to.equal(numberOfFolks * 2);
    expect(company.length).to.equal(numberOfFolks);
    expect(people).to.have.lengthOf(numberOfFolks * 5);

    const carIds = cars.map((car) => car.id);
    carIds.map((id) => people.findWhere("cars", id));

    const companyIds = company.map((c) => c.id);
    companyIds.map((id) => people.findWhere("employer", id));
  });

  it("using a specific config for createRelationshipLinks works as expected", async function () {
    this.timeout(15000);
    const numberOfFolks = 25;
    await Mock(FancyPerson, db)
      .followRelationshipLinks({
        cars: [3, 5],
      })
      .generate(numberOfFolks);
    const people = await List.all(FancyPerson);

    expect(people).to.have.lengthOf(numberOfFolks);
  });

  it("Adding a record fires local events as expected", async () => {
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);
    await Record.add(FancyPerson, {
      name: "Bob Barker",
    });

    const types = events.map((e) => e.type);

    expect(types).to.include(FmEvents.RECORD_ADDED_LOCALLY);
    expect(types).to.include(FmEvents.RECORD_ADDED_CONFIRMATION);
  });

  it("Mocking data does not fire fire local events (RECORD_ADD_LOCALLY, RECORD_ADD_CONFIRMATION) to dispatch", async () => {
    const events: IDictionary[] = [];
    FireModel.dispatch = async (e: IReduxAction) => events.push(e);
    await Mock(FancyPerson).generate(10);
    expect(events).to.have.lengthOf(0);
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
      expect(e.code).to.equal("forbidden");
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
    await wait(5); // ensures that DB event has time to fire

    const eventTypes: Set<string> = new Set();
    events.forEach((e) => eventTypes.add(e.type));
    console.log(eventTypes);

    expect(Array.from(eventTypes)).to.include(FmEvents.RECORD_ADDED);
    expect(Array.from(eventTypes)).to.include(
      "@firemodel/RECORD_ADDED_LOCALLY"
    );
    expect(Array.from(eventTypes)).to.include(
      "@firemodel/RECORD_ADDED_CONFIRMATION"
    );
    const locally = events.find(
      (e) => e.type === FmEvents.RECORD_ADDED_LOCALLY
    );
    const confirm = events.find(
      (e) => e.type === FmEvents.RECORD_ADDED_CONFIRMATION
    );
    expect(locally).to.haveOwnProperty("transactionId");
    expect(confirm).to.haveOwnProperty("transactionId");
    expect(locally.transactionId).to.equal(confirm.transactionId);
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
    expect(Array.from(eventTypes)).to.not.include(FmEvents.RECORD_ADDED);

    await Mock(FancyPerson).generate(1);
    eventTypes = new Set(events.map((e) => e.type));

    expect(Array.from(eventTypes)).to.not.include(FmEvents.RECORD_ADDED);
    await Record.add(FancyPerson, {
      name: "Bob the Builder",
    });
    const eventTypes2: string[] = Array.from(
      new Set(events.map((e) => e.type))
    );

    expect(eventTypes2).to.include(FmEvents.RECORD_ADDED);
  });

  it.skip("Updating a record with values which are unchanged does NOT fire a server watch event", async () => {
    //
  });
});

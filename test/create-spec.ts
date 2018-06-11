// tslint:disable:no-implicit-dependencies
import { OldModel, BaseSchema, Record } from "../src/index";
import { DB } from "abstracted-admin";
import { SchemaCallback } from "firemock";
import * as chai from "chai";
const expect = chai.expect;

const personMock: SchemaCallback<Person> = h => () => ({
  name: h.faker.name.firstName(),
  age: h.faker.random.number({ min: 1, max: 100 })
});

export class Person extends BaseSchema {
  public static create(db: DB) {
    const m = new OldModel<Person>(Person, db);
    m.mockGenerator = personMock;
    return m;
  }
  public name: string;
  public age: number;
}

describe("Create a Model: ", async () => {
  it("can instantiate a Model", async () => {
    const db = new DB({ mocking: true });
    const person = new OldModel<Person>(Person, db);

    expect(person).to.be.an("object");
    expect(person).to.be.an.instanceOf(OldModel);
    expect(person.modelName).to.equal("person");
    // const record = await person.newRecord();
    // expect(record).to.be.an.instanceOf(Record);
    // expect(record.data).to.be.an.instanceOf(Person);
  });

  it("Model's create() method instantiates", async () => {
    const db = new DB({ mocking: true });
    const person = OldModel.create(Person, { db });
    person.pluralName = "foobar";
    expect(person).to.be.an("object");
    expect(person).to.be.an.instanceOf(OldModel);
    expect(person.modelName).to.equal("person");
    // const record = await person.newRecord();
    // expect(record.existsOnDB).to.equal(false);
    // expect(record.data).is.instanceOf(Person);
    // expect(record.data.META).does.exist.and.is.an("object");
    // await record.initialize({ name: "Testy McTesty", age: 50 });
    // expect(record.data.name).to.equal("Testy McTesty");
    // expect(record.data.META.properties).is.an("object");
    // record.pushKey("tags", "foobar");
  });

  it("singular and plural names are right", () => {
    const db = new DB({ mocking: true });
    const person = OldModel.create(Person, { db });
    expect(person.modelName).to.equal("person");
    expect(person.pluralName).to.equal("people");
  });

  it("can override plural name by setting pluralName", () => {
    const db = new DB({ mocking: true });
    const person = OldModel.create(Person, { db });
    person.pluralName = "foobar";
    expect(person.modelName).to.equal("person");
    expect(person.pluralName).to.equal("foobar");
  });
});

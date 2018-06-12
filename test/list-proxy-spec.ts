// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
import { ListProxy } from "../src/ListProxy";
import { ArrayOfRecords } from "../src/ArrayOfRecords";
import { Person } from "./testing/person";
import { DB } from "abstracted-admin";

const expect = chai.expect;

describe("List Proxy →", () => {
  it("Basic instantiation", async () => {
    const lp = ListProxy(Number)([1, 2, 3]);
    expect(lp.length).to.equal(3);
    expect(lp.filter(i => i !== 2).length).to.equal(2);
  });

  it(`ArrayOfRecords works as an array and has functional props`, () => {
    const data = new ArrayOfRecords<any>(...[1, 2, 3]);
    expect(data.length).to.equal(3);
    expect(data.modelName).to.equal("unknown");
  });

  it("Passing in a Model opens up meta info", async () => {
    const data: Person[] = [
      {
        id: "1234",
        name: "Fred",
        age: 23
      },
      {
        id: "4567",
        name: "Carol",
        age: 32
      }
    ];
    const lp = ListProxy(Person)(data);
    expect(lp.length).to.equal(2);
    expect(lp.modelName).to.equal("person");
    expect(lp.pluralName).to.equal("people");
    expect(lp.relationships).to.have.lengthOf(4);
    expect(lp).to.be.an.instanceOf(ArrayOfRecords);
    expect(lp.property("age").type).to.equal("Number");
  });

  it("Pushing a new element is sent to the database as new record", async () => {
    const db = new DB({ mocking: true });
    await db.waitForConnection();
    const people: Person[] = [
      {
        id: "1234",
        name: "Fred",
        age: 23
      },
      {
        id: "4567",
        name: "Carol",
        age: 32
      }
    ];
    db.mock.updateDB({
      authenticated: { people }
    });
    const toStart = await db.getList("/authenticated/people");

    expect(toStart).to.have.lengthOf(2);
    const peeps = ListProxy(Person)(people);
    peeps.push({
      id: "8888",
      name: "Glentilda",
      age: 99
    });
    expect(peeps.length).to.equal(3);
  });

  it.skip("Running a filter operation returns another proxy list with meta info still available", async () => {
    const people: Person[] = [
      {
        id: "1234",
        name: "Fred",
        age: 23
      },
      {
        id: "4567",
        name: "Carol",
        age: 32
      }
    ];
    const proxy = ListProxy(Person)(people);
    const test = proxy.filter(i => i.id === "1234");
    expect(test).to.be.instanceof(ArrayOfRecords);
    expect(test.length).to.equal(1);
    expect(test.modelName).to.equal("person");
  });
});

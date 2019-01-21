// tslint:disable:no-implicit-dependencies
import { Model, model, List, property } from "../src";
import { DB } from "abstracted-admin";
import * as chai from "chai";
import { Mock } from "../src/Mock";
import { FancyPerson } from "./testing/FancyPerson";
import { Car } from "./testing/Car";
import { Company } from "./testing/Company";
import * as helpers from "./testing/helpers";
import { Record } from "../src/record";
const expect = chai.expect;

@model({})
export class SimplePerson extends Model {
  @property public name: string;
  @property public age: number;
  @property public phoneNumber: string;
}

describe("Mocking:", () => {
  let db: DB;
  beforeEach(async () => {
    db = new DB({ mocking: true });
    await db.waitForConnection();
    List.defaultDb = db;
  });
  it("the auto-mock works for named properties", async () => {
    await Mock(SimplePerson, db).generate(10);
    const people = await List.all(SimplePerson);

    expect(people).to.have.lengthOf(10);
    people.map(person => {
      expect(person.age)
        .to.be.a("number")
        .greaterThan(0)
        .lessThan(101);
    });
  });

  it("giving a @mock named hint corrects the typing of a named prop", async () => {
    await Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(10);
    people.map(person => {
      expect(person.otherPhone).to.be.a("string");
      expect(/[\.\(-]/.test(person.otherPhone)).to.equal(true);
    });
  });

  it("passing in a function to @mock produces expected results", async () => {
    await Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(10);
    people.map(person => {
      expect(person.foobar).to.be.a("string");
      expect(person.foobar).to.contain("hello");
    });
  });

  it("using createRelationshipLinks() sets fake links to all relns", async () => {
    const numberOfFolks = 1;
    await Mock(FancyPerson, db)
      .createRelationshipLinks()
      .generate(numberOfFolks);

    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(numberOfFolks);
    people.map(person => {
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

    const carIds = cars.map(car => car.id);
    carIds.map(id => people.findWhere("cars", id));

    const companyIds = company.map(c => c.id);
    companyIds.map(id => people.findWhere("employer", id));
  });

  it("using a specific config for createRelationshipLinks works as expected", async () => {
    const numberOfFolks = 25;
    await Mock(FancyPerson, db)
      .followRelationshipLinks({
        cars: [3, 5]
      })
      .generate(numberOfFolks);
    const people = await List.all(FancyPerson);

    expect(people).to.have.lengthOf(numberOfFolks);
  });
});

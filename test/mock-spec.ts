// tslint:disable:no-implicit-dependencies
import { Model, model, List, property } from "../src";
import { DB } from "abstracted-admin";
import * as chai from "chai";
import { Mock } from "../src/Mock";
import { FancyPerson } from "./testing/FancyPerson";
import { Car } from "./testing/Car";
import { Company } from "./testing/company";
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
    Mock(SimplePerson, db).generate(10);
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
    Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(10);
    people.map(person => {
      expect(person.otherPhone).to.be.a("string");
      expect(/[\.\(-]/.test(person.otherPhone)).to.equal(true);
    });
  });

  it("passing in a function to @mock produces expected results", async () => {
    Mock(FancyPerson, db).generate(10);
    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(10);
    people.map(person => {
      expect(person.foobar).to.be.a("string");
      expect(person.foobar).to.contain("hello");
    });
  });

  it("using createRelationshipLinks() sets fake links to all relns", async () => {
    Mock(FancyPerson, db)
      .createRelationshipLinks()
      .generate(10);
    const people = await List.all(FancyPerson);
    expect(people).to.have.lengthOf(10);
    people.map(person => {
      expect(person.employer).to.be.a("string");
      expect(person.cars)
        .to.be.an("array")
        .and.to.be.length(2);
    });
  });

  it("using followRelationshipLinks() sets links and adds those models", async () => {
    Mock(FancyPerson, db)
      .followRelationshipLinks()
      .generate(10);
    const people = await List.all(FancyPerson);
    const company = await List.all(Company);
    const cars = await List.all(Car);

    expect(people).to.have.lengthOf(10);
    expect(cars.length).to.equal(20);
    expect(company.length).to.equal(10);
    people.map(person => {
      expect(person.employer).to.be.a("string");
      expect(company.findById(person.employer)).to.be.an("object");
      expect(company.findById(person.employer).data.employees)
        .to.be.a("number")
        .and.be.greaterThan(0);
      expect(person.cars)
        .to.be.an("array")
        .and.to.be.length(2);
      expect(cars.findById(person.cars[0])).to.be.an("object");
      expect(cars.findById(person.cars[1])).to.be.an("object");
      expect(cars.findById(person.cars[0]).data.model).to.be.a("string");
      expect(cars.findById(person.cars[1]).data.modelYear).to.be.a("number");
    });
  });

  it("using a specific config for createRelationshipLinks works as expected", async () => {
    Mock(FancyPerson, db)
      .followRelationshipLinks({
        cars: [3, 5]
      })
      .generate(25);
    const people = await List.all(FancyPerson);

    people.map(person => {
      expect(person.cars.length)
        .to.be.greaterThan(2)
        .and.lessThan(6);
    });
  });
});

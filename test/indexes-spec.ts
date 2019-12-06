// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
import { Person as AuditedPerson } from "./testing/AuditedPerson";
import { Record } from "../src";
import { Car } from "./testing/Car";
const expect = chai.expect;

describe("DB Indexes:", () => {
  it("Model shows indexes as expected on Model with no additional indexes", async () => {
    const person = Record.create(AuditedPerson);
    console.log(person.META.dbIndexes);

    const expected = ["lastUpdated", "createdAt"];
    expect(person.META.dbIndexes)
      .is.an("array")
      .and.has.lengthOf(expected.length);
    person.META.dbIndexes.map(i =>
      expect(expected.includes(i.property)).to.equal(true)
    );
  });

  it("Model shows indexes as expected on Model with additional indexes", async () => {
    const car = Record.create(Car);
    const expected = ["lastUpdated", "createdAt", "modelYear"];
    expect(car.META.dbIndexes)
      .is.an("array")
      .and.has.lengthOf(expected.length);
    car.META.dbIndexes.map(i =>
      expect(expected.includes(i.property)).to.equal(true)
    );
  });
});

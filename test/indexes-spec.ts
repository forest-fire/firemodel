import { Person as AuditedPerson } from "./testing/AuditedPerson";
import { Car } from "./testing/Car";
import { Record } from "../src";

describe("DB Indexes:", () => {
  it("Model shows indexes as expected on Model with no additional indexes", async () => {
    const person = Record.create(AuditedPerson);

    const expected = ["lastUpdated", "createdAt"];
    expect(person.META.dbIndexes).toBeArray();
    expect(person.META.dbIndexes).toHaveLength(expected.length);
    person.META.dbIndexes.map((i) =>
      expect(expected.includes(i.property)).toBe(true)
    );
  });

  it("Model shows indexes as expected on Model with additional indexes", async () => {
    const car = Record.create(Car);
    const expected = ["lastUpdated", "createdAt", "modelYear"];
    expect(car.META.dbIndexes).toBeArray();
    expect(car.META.dbIndexes).toHaveLength(expected.length);
    car.META.dbIndexes.map((i) =>
      expect(expected.includes(i.property)).toBe(true)
    );
  });
});

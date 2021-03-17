import { IFmWatchEvent, Record } from "../src";
import { IRealTimeAdmin, RealTimeAdmin } from "universal-fire";
import {
  buildRelationshipPaths,
  createCompositeKeyFromFkString,
  extractFksFromPaths,
} from "@/core/records";

import { Car } from "./testing/Car";
import { Company } from "./testing/Company";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";
import { FancyPerson } from "./testing/FancyPerson";
import { FireModel } from "@/index";
import { FmEvents } from "@/index";
import OffsetCar from "./testing/dynamicPaths/Car";
import { Pay } from "./testing/Pay";
import { Person } from "./testing/Person";
import { pathJoin } from "@/util";

const hasManyPaths = (id: string, now: number) => [
  { path: `/authenticated/people/${id}/children/janet`, value: true },
  { path: `/authenticated/people/${id}/children/bob`, value: true },
  { path: `/authenticated/people/${id}/lastUpdated`, value: now },
  { path: `/authenticated/people/abc/lastUpdated`, value: now },
];

const hasOnePaths = (id: string, now: number) => [
  { path: `/authenticated/people/${id}/company`, value: "microsoft" },
  { path: `/authenticated/people/${id}/lastUpdated`, value: now },
  { path: `/authenticated/companies/microsoft/employees/${id}`, value: true },
  { path: `/authenticated/companies/microsoft/lastUpdated`, value: now },
];

describe("Relationship > ", () => {
  beforeEach(async () => {
    FireModel.defaultDb = await RealTimeAdmin.connect({ mocking: true });;
  });

  it("extractFksFromPath pulls out the ids which are being changed", async () => {
    const person = Record.createWith(Person, { id: "joe", name: "joe" });
    const now = 12312256;
    const hasMany = hasManyPaths(person.id, now);
    const hasOne = hasOnePaths(person.id, now);

    const extractedHasMany = extractFksFromPaths(person, "children", hasMany);
    const extractedHasOne = extractFksFromPaths(person, "company", hasOne);

    expect(extractedHasMany).toBeArray();
    expect(extractedHasMany).toHaveLength(2);
    expect(extractedHasOne).toBeInstanceOf(Array);
    expect(extractedHasOne).toHaveLength(1);

    expect(extractedHasMany).toEqual(expect.arrayContaining(["janet"]));
    expect(extractedHasMany).toEqual(expect.arrayContaining(["bob"]));
    expect(extractedHasOne).toEqual(expect.arrayContaining(["microsoft"]));
  });

  it("build relationship paths for 1:M", async () => {
    const person = Record.createWith(Person, { id: "joe", name: "joe" });

    const paths = buildRelationshipPaths(person, "children", "abcdef");

    expect(paths.map((i) => i.path)).toEqual(
      expect.arrayContaining([pathJoin(person.dbPath, "children", "abcdef")])
    );
  });

  it("build relationship paths for 1:M (with inverse)", async () => {
    const person = Record.createWith(Person, { id: "joe", name: "joe" });
    const company = Record.createWith(Company, {
      id: "microsoft",
      name: "Microsquish",
    });
    const paths = buildRelationshipPaths(person, "company", "microsoft");
    expect(paths.map((i) => i.path)).toEqual(
      expect.arrayContaining([pathJoin(person.dbPath, "company")])
    );
    const pathWithFkRef = paths
      .filter((p) => p.path.includes(pathJoin(person.dbPath, "company")))
      .pop();
    const pathWithInverseRef = paths
      .filter((p) => p.path.includes(pathJoin(company.dbPath, "employees")))
      .pop();

    expect(pathWithFkRef.value).toBe("microsoft");
    expect(pathWithInverseRef.path).toContain(person.id);
    expect(pathWithInverseRef.value).toBe(true);
  });

  it("can build composite key from FK string", async () => {
    const t1 = createCompositeKeyFromFkString("foo::geo:CT::age:13");
    expect(t1.id).toBe("foo");
    expect(t1.geo).toBe("CT");
    expect(t1.age).toBe("13");

    const t2 = createCompositeKeyFromFkString("foo");
    expect(t2.id).toBe("foo");
    expect(Object.keys(t2)).toHaveLength(1);
  });

  it("can build TYPED composite key from Fk string and reference model", async () => {
    const t1 = createCompositeKeyFromFkString("foo::age:13", Person);
    expect(t1.id).toBe("foo");
    expect(t1.age).toBe(13);
  });

  it("building a TYPED composite key errors when invalid property is introduced", async () => {
    try {
      const t1 = createCompositeKeyFromFkString("foo::age:13::geo:CT", Person);

      throw new Error("Should not reach this point because of invalid prop");
    } catch (e) {
      expect(e.firemodel).toBe(true);
      expect(e.code).toBe("invalid-composite-key");
    }
  });

  it("build relationship paths for M:1 (with one-way directionality)", async () => {
    const person = Record.createWith(Person, { id: "joe", name: "joe" });
    const father = Record.createWith(Person, { id: "abcdef", name: "poppy" });
    const paths = buildRelationshipPaths(person, "father", "abcdef");

    expect(paths.map((i) => i.path)).toEqual(
      expect.arrayContaining([pathJoin(father.dbPath, "children", person.id)])
    );
  });

  it.skip("building relationship paths that point to non-existing records throws error when option is set", async () => {
    throw new Error("test not written");
  });

  it("build paths 1:M", async () => {
    const person = Record.createWith(FancyPerson, {
      id: "fancy-bob",
      name: "Bob",
      age: 23,
    });
    const car = Record.createWith(Car, "12345");
    const paths = buildRelationshipPaths(person, "cars", "12345");
    const personFkToCars = pathJoin(person.dbPath, "cars", "12345");
    const carToOwner = pathJoin(car.dbPath, "owner");

    expect(paths.map((p) => p.path)).toEqual(
      expect.arrayContaining([personFkToCars])
    );
    expect(paths.map((p) => p.path)).toEqual(
      expect.arrayContaining([carToOwner])
    );
  });

  it("build paths 1:M (with dynamic offset)", async () => {
    const person = Record.createWith(DeepPerson, "bob-marley::group:musicians");
    const carId = "my-car::vendor:Chevy";
    const car = Record.createWith(OffsetCar, carId);
    const paths = buildRelationshipPaths(person, "cars", carId);
    const personFkToCars = pathJoin(person.dbPath, "cars", carId);
    const carToOwner = pathJoin(car.dbPath, "owners", person.compositeKeyRef);

    expect(paths.map((p) => p.path)).toEqual(
      expect.arrayContaining([personFkToCars])
    );
    expect(paths.map((p) => p.path)).toEqual(
      expect.arrayContaining([carToOwner])
    );
  });

  it("using addToRelationship() on a hasMany (M:1) relationship updates DB and sends events", async () => {
    const person = await Record.add(FancyPerson, {
      name: "Bob",
      age: 23,
    });
    expect(person.id).toBeDefined();
    expect(person.id).toBeString();
    const lastUpdated = person.data.lastUpdated;
    const events: IFmWatchEvent[] = [];
    Record.dispatch = async (evt: IFmWatchEvent) => events.push(evt);
    await person.addToRelationship("cars", "12345");

    const eventTypes = Array.from(new Set(events.map((e) => e.type)));
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.RELATIONSHIP_ADDED_LOCALLY])
    );
    expect(eventTypes).toEqual(
      expect.arrayContaining([FmEvents.RELATIONSHIP_ADDED_CONFIRMATION])
    );

    const p = await Record.get(FancyPerson, person.id);
    expect(Object.keys(p.data.cars)).toEqual(expect.arrayContaining(["12345"]));

    const c = await Record.get(Car, "12345");
    expect(c.data.owner).toContain(person.id);
  });

  it("using addToRelationship in a M:M relationship", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992",
    });

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male",
    });

    const pay = await Record.add(Pay, {
      amount: "2400.00",
    });

    await company.addToRelationship("employees", person.id);
    await person.addToRelationship("pays", pay.id);

    expect((company.data.employees as any)[person.id]).toBe(true);
  });

  it("testing adding relationships with associate", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992",
    });

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male",
    });

    const person2 = await Record.add(Person, {
      name: "Jane Bloggs",
      age: 24,
      gender: "female",
    });

    const pay = await Record.add(Pay, {
      amount: "2400.00",
    });

    await company.associate("employees", person.id);
    await person.associate("pays", pay.id);
    await company.addToRelationship("employees", [person.id, person2.id]);
    await company.associate("employees", [person.id, person2.id]);

    expect((company.data.employees as any)[person.id]).toBe(true);
  });

  it("testing removing relationships with disassociate()", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992",
    });

    const person = await Record.add(Person, {
      id: "p1",
      name: "Joe Bloggs",
      age: 22,
      gender: "male",
    });

    const person2 = await Record.add(Person, {
      id: "p2",
      name: "Jane Bloggs",
      age: 24,
      gender: "female",
    });

    const pay = await Record.add(Pay, {
      amount: "2400.00",
    });

    await person.associate("pays", pay.id);
    await company.associate("employees", [person.id, person2.id]);
    await company.disassociate("employees", person2.id);
    await person.disassociate("pays", pay.id);

    expect(company.data.employees[person.id as any]).toBe(true);
    expect(company.data.employees[person2.id as any]).not.toBe(true);
    expect((person.data.pays as any)[pay.id]).not.toBe(true);
  });

  it("testing it should throw an error when incorrect refs is passed in with associate", async () => {
    const company = await Record.add(Company, {
      name: "Acme Inc",
      founded: "1992",
    });

    const person = await Record.add(Person, {
      name: "Joe Bloggs",
      age: 22,
      gender: "male",
    });

    try {
      await person.associate("company", [company.id]);
      expect(false);
    } catch (e) {
      expect(e.message).toBe(
        "Ref -LYdV5fhRmiGWXwdAWSg must not be an array of strings."
      );
    }
  });
  // it.skip("using addToRelationship() on a hasMany relationship with an inverse of hasOne", async () => {
  //   const person = await Record.add(Person, {
  //     name: "Bob",
  //     age: 23
  //   });
  //   expect(person.id).to.exist.and.to.be.a("string");
  //   const lastUpdated = person.data.lastUpdated;
  //   const events: IFmRecordEvent[] = [];
  //   Record.dispatch = (evt: IFmRecordEvent) => events.push(evt);
  //   await person.addToRelationship("concerts", "12345");
  //   expect((person.data.concerts as any)["12345"]).to.equal(true);
  //   expect(events).to.have.lengthOf(2);
  //   const eventTypes = new Set(events.map(e => e.type));
  //   expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED)).to.equal(true);
  //   expect(eventTypes.has(FMEvents.RELATIONSHIP_ADDED_LOCALLY)).to.equal(true);
  // });
});

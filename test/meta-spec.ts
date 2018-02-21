// tslint:disable:no-implicit-dependencies
import {
  Model,
  BaseSchema,
  property,
  constrainedProperty,
  constrain,
  desc,
  min,
  max,
  length,
  schema
} from "../src/index";
import DB from "abstracted-admin";
import { SchemaCallback } from "firemock";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { Klass, ContainedKlass, SubKlass } from "./testing/klass";
import { Person } from "./testing/person";
const expect = chai.expect;
import "reflect-metadata";

describe("schema() decorator: ", () => {
  it("can read Schema meta properties", () => {
    const myclass: any = new Klass();
    expect(myclass.META.dbOffset).to.equal("authenticated");
    expect(myclass.META.localOffset).to.equal("foobar");
  });

  it("can read Property meta properties off of META.property", () => {
    const myclass = new Klass();
    expect(myclass.META.property("foo").type).to.equal("String");
    expect(myclass.META.property("bar").type).to.equal("Number");
    expect(myclass.META.property("bar3").max).to.equal(10);
  });

  it("setting meta throws error", () => {
    const myclass: any = new Klass();
    try {
      myclass.META = { foo: "bar" };
      expect(false, "setting meta property is not allowed!");
    } catch (e) {
      expect(e.message).to.equal("The meta property can only be set with the @schema decorator!");
    }
  });
});

describe("property decorator: ", () => {
  it("can discover type for properties on class", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("foo", myclass).type).to.equal("String");
    expect(Reflect.getMetadata("bar", myclass).type).to.equal("Number");
    expect(Reflect.getMetadata("bar2", myclass).type).to.equal("Number");
    expect(Reflect.getMetadata("sub", myclass).type).to.equal("String");
    expect(Reflect.getMetadata("id", myclass).type).to.equal("String");
  });

  it("constraint() decorator-factory adds constrain metadata", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("bar", myclass).min).to.equal(2);
  });

  it("constrainedProperty() decorator-factory allows adding multiple contraints", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("foobar", myclass).length).to.equal(15);
    expect(Reflect.getMetadata("foobar", myclass).desc).to.equal("who doesn't love a foobar?");
    expect(Reflect.getMetadata("bar3", myclass).min).to.equal(5);
    expect(Reflect.getMetadata("bar3", myclass).max).to.equal(10);
  });

  it("@pushKey decorator is reflected in meta", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("tags", myclass).pushKey).to.equal(true);
    expect(myclass.META.pushKeys).to.include("tags");
    expect(myclass.META.pushKeys).to.have.lengthOf(1);
    const model = new Model<Klass>(Klass, new DB({ mocking: true }));
    expect(model.pushKeys).to.include("tags");
  });

  it("@min(), @max(), @length(), and @desc() decorator-factories work", () => {
    const myclass = new Klass();
  });

  it("all base meta keys are represented", () => {
    const myclass = new Klass();
    const keys: string[] = Reflect.getMetadataKeys(myclass);
    expect(keys).to.include.members(["id", "lastUpdated", "createdAt"]);
  });
});

describe("relationship decorators: ", () => {
  it("ownedBy() sets correct meta props", async () => {
    const person = new Person();
    const keys: string[] = Reflect.getMetadataKeys(person);
    expect(keys).to.include.members(["fatherId", "motherId"]);
    expect(person.META.property("fatherId").isRelationship).to.equal(true);
    expect(person.META.property("fatherId").relType).to.be.equal("ownedBy");
    expect(person.META.property("motherId").relType).to.be.equal("ownedBy");
  });

  it("hasMany() sets correct meta props", async () => {
    const person = new Person();
    const keys: string[] = Reflect.getMetadataKeys(person);
    expect(keys).to.include.members(["children"]);
    expect(person.META.property("children").isRelationship).to.equal(true);
    expect(person.META.property("children").relType).to.be.equal("hasMany");
  });

  it("@relationships show up on Schema's relationships array", async () => {
    const person = new Person();
    const ids = person.META.relationships.map(r => r.property);
    expect(person.META.relationships.length).to.equal(4);
    expect(ids).to.include("fatherId");
    expect(ids).to.include("motherId");
    expect(ids).to.include("children");
    expect(ids).to.include("employerId");
  });
  it("@relationships show up on Model", async () => {
    const PersonModel = new Model<Person>(Person, new DB({ mocking: true }));
    expect(PersonModel.relationships.map(p => p.property)).to.include("fatherId");
    expect(PersonModel.relationships.map(p => p.property)).to.include("children");
  });

  it("@properties show up on Schema's properties array", async () => {
    const person = new Person();
    const ids = person.META.properties.map(r => r.property);
    const base = person.META.properties.filter(f => f.isBaseSchema);
    expect(person.META.relationships.length).to.equal(4);
    expect(ids).to.include("name");
    expect(ids).to.include("age");
    expect(ids).to.include("lastUpdated");
    expect(ids).to.include("createdAt");
    expect(base.length).to.equal(3);
    expect(base.map(b => b.property)).to.include("lastUpdated");
  });

  it("@properties show up on Model", async () => {
    const PersonModel = new Model<Person>(Person, new DB({ mocking: true }));
    expect(PersonModel.properties.map(p => p.property)).to.include("name");
    expect(PersonModel.properties.map(p => p.property)).to.include("lastUpdated");
  });

  it("inverse() sets correct meta props", async () => {
    const person = new Person();
    expect(person.META.property("motherId").inverseProperty).to.equal("children");
    expect(person.META.property("fatherId").inverseProperty).to.equal("children");
  });
});

import { Klass } from "./testing/klass";
import { Person } from "./testing/Person";
// import { DB, SDK } from "universal-fire";
import { RealTimeAdmin } from "@forest-fire/real-time-admin";
import { Record } from "../src";

describe("schema() decorator: ", () => {
  it("can read Schema meta properties", () => {
    const myclass: any = new Klass();
    expect(myclass.META.dbOffset).toBe("authenticated");
    expect(myclass.META.localPrefix).toBe("foobar");
  });

  it("can read Property meta properties off of META.property", () => {
    const myclass = new Klass();
    expect(myclass.META.property("foo").type).toBeString();
    expect(myclass.META.property("bar").type).toBe("number");
    expect(myclass.META.property("bar3").max).toBe(10);
  });

  it("setting meta throws error", () => {
    const myclass: any = new Klass();
    try {
      myclass.META = { foo: "bar" };
      expect(false);
    } catch (e) {
      expect(e.message).toBe(
        "The META properties should only be set with the @model decorator at design time!"
      );
    }
  });
});

describe("property decorator: ", () => {
  it("can discover type for properties on class", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("foo", myclass).type).toBeString();
    expect(Reflect.getMetadata("bar", myclass).type).toBe("number");
    expect(Reflect.getMetadata("bar2", myclass).type).toBe("number");
    expect(Reflect.getMetadata("sub", myclass).type).toBeString();
    expect(Reflect.getMetadata("id", myclass).type).toBeString();
  });

  it("constraint() decorator-factory adds constrain metadata", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("bar", myclass).min).toBe(2);
  });

  it("constrainedProperty() decorator-factory allows adding multiple contraints", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("foobar", myclass).length).toBe(15);
    expect(Reflect.getMetadata("foobar", myclass).desc).toBe(
      "who doesn't love a foobar?"
    );
    expect(Reflect.getMetadata("bar3", myclass).min).toBe(5);
    expect(Reflect.getMetadata("bar3", myclass).max).toBe(10);
  });

  it("@pushKey decorator is reflected in meta", () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata("tags", myclass).pushKey).toBe(true);
    expect(myclass.META.pushKeys).toEqual(expect.arrayContaining(["tags"]));
    expect(myclass.META.pushKeys).toHaveLength(1);
    const myRecord = Record.create(Klass);
    expect(myRecord.pushKeys).toEqual(expect.arrayContaining(["tags"]));
  });

  it("@min(), @max(), @length(), and @desc() decorator-factories work", () => {
    const myclass = new Klass();
  });

  it("all base meta keys are represented", () => {
    const myclass = new Klass();
    const keys: string[] = Reflect.getMetadataKeys(myclass);
    expect(keys).toEqual(
      expect.arrayContaining(["id", "lastUpdated", "createdAt"])
    );
  });
});

describe("relationship decorators: ", () => {
  it("hasOne() sets correct meta props", async () => {
    const person = new Person();
    const keys: string[] = Reflect.getMetadataKeys(person);
    expect(keys).toEqual(expect.arrayContaining(["father", "mother"]));

    expect(person.META.relationship("father").isRelationship).toBe(true);
    expect(person.META.relationship("father").relType).toBe("hasOne");
    expect(person.META.relationship("mother").relType).toBe("hasOne");
  });

  it("hasMany() sets correct meta props", async () => {
    const person = new Person();
    const keys: string[] = Reflect.getMetadataKeys(person);
    expect(keys).toEqual(expect.arrayContaining(["children"]));
    expect(person.META.relationship("children").isRelationship).toBe(true);
    expect(person.META.relationship("children").relType).toBe("hasMany");
  });

  it("@relationships show up on Schema's relationships array", async () => {
    const person = new Person();
    const ids = person.META.relationships.map((r) => r.property);

    expect(ids).toEqual(expect.arrayContaining(["father"]));
    expect(ids).toEqual(expect.arrayContaining(["mother"]));
    expect(ids).toEqual(expect.arrayContaining(["children"]));
    expect(ids).toEqual(expect.arrayContaining(["concerts"]));
    expect(ids).toEqual(expect.arrayContaining(["company"]));
    expect(ids).toEqual(expect.arrayContaining(["pays"]));
  });
  it("@relationships show up on Model", async () => {
    const PersonRecord = Record.create(Person, {
      db: await RealTimeAdmin.connect({ mocking: true }),
    });

    expect(PersonRecord.META.relationships.map((p) => p.property)).toEqual(
      expect.arrayContaining(["father"])
    );
    expect(PersonRecord.META.relationships.map((p) => p.property)).toEqual(
      expect.arrayContaining(["children"])
    );
  });

  it("@properties show up on Schema's properties array", async () => {
    const person = new Person();
    const props = person.META.properties.map((r) => r.property);

    // positive tests
    expect(props).toEqual(expect.arrayContaining(["name"]));
    expect(props).toEqual(expect.arrayContaining(["age"]));
    expect(props).toEqual(expect.arrayContaining(["lastUpdated"]));
    expect(props).toEqual(expect.arrayContaining(["createdAt"]));
    // negative tests
    expect(props).toEqual(expect.not.arrayContaining(["mother"]));
    expect(props).toEqual(expect.not.arrayContaining(["concerts"]));
  });

  it("@relationships represent all relationships in a model", async () => {
    const person = new Person();
    const props = person.META.relationships.map((r) => r.property);

    expect(props).toEqual(expect.arrayContaining(["mother"]));
    expect(props).toEqual(expect.arrayContaining(["father"]));
    expect(props).toEqual(expect.arrayContaining(["concerts"]));
    expect(props).toEqual(expect.arrayContaining(["company"]));
    expect(props).toEqual(expect.arrayContaining(["pays"]));

    person.META.relationships.map((p) => {
      if (p.relType === "hasOne") {
        expect(p.type).toBeString();
      }
      if (p.relType === "hasMany") {
        expect(p.type).toBe("Object");
      }
    });

    const mother = person.META.relationships.filter(
      (i) => i.property === "mother"
    )[0];

    expect(mother.inverseProperty).toBe("children");
  });

  it("@properties show up on Model", async () => {
    const PersonRecord = Record.create(Person, {
      db: await RealTimeAdmin.connect({ mocking: true }),
    });
    expect(PersonRecord.META.properties.map((p) => p.property)).toEqual(
      expect.arrayContaining(["name"])
    );
    expect(PersonRecord.META.properties.map((p) => p.property)).toEqual(
      expect.arrayContaining(["lastUpdated"])
    );
  });

  it("inverse() sets correct meta props", async () => {
    const person = new Person();
    expect(person.META.relationship("mother").inverseProperty).toBe("children");
    expect(person.META.relationship("father").inverseProperty).toBe("children");
  });
});

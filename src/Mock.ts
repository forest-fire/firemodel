import { Model } from "./Model";
import { IDictionary } from "common-types";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Record } from "./Record";
import {
  arrayToHash,
  hashToArray,
  keyValueArrayToDictionary
} from "typed-conversions";
import { IModelPropertyMeta } from "./decorators/schema";
import { fbKey } from "./index";
import { set } from "lodash";
import { MockHelper } from "firemock";
import { pathJoin } from "./path";
import { getModelMeta, modelsWithMeta } from "./ModelMeta";
import { writeAudit } from "./Audit";
import { updateToAuditChanges } from "./util";
import { Parallel } from "wait-in-parallel";

export type ICardinalityConfig<T> = {
  [key in keyof T]: [number, number] | number | true
};

export interface IMockConfig<T> {
  relationshipBehavior: "ignore" | "link" | "follow";
  cardinality?: IDictionary<number | [number, number] | true>;
}

function defaultCardinality<T>(r: Record<T>) {
  return r.META.relationships.reduce(
    (prev, curr) => {
      prev = { ...prev, [curr.property]: true };
    },
    {} as any
  );
}

function dbOffset<T extends Model>(record: Record<T>, payload: IDictionary<T>) {
  const output = {};
  const meta = getModelMeta(record.modelName);
  const path = pathJoin(
    record.META.dbOffset || meta.dbOffset || "",
    record.pluralName
  );
  set(output, path.replace(/\//g, "."), payload);

  return output;
}

function fakeIt(helper: MockHelper, type: string) {
  switch (type) {
    case "id":
      return fbKey();
    case "String":
      return helper.faker.lorem.words(5);
    case "Number":
      return Math.round(Math.random() * 100);
    case "Boolean":
      return Math.random() > 0.49 ? true : false;
    case "Object":
      return {};
    case "name":
      return helper.faker.name.firstName() + " " + helper.faker.name.lastName();
    case "firstName":
      return helper.faker.name.firstName();
    case "lastName":
      return helper.faker.name.lastName();
    case "company":
      return helper.faker.company.companyName();
    case "address":
      return (
        helper.faker.address.secondaryAddress() +
        ", " +
        helper.faker.address.city() +
        ", " +
        helper.faker.address.stateAbbr() +
        "  " +
        helper.faker.address.zipCode()
      );
    case "streetName":
      return helper.faker.address.streetName();
    case "streetAddress":
      return helper.faker.address.streetAddress();
    case "city":
      return helper.faker.address.city();
    case "state":
      return helper.faker.address.state();
    case "stateAbbr":
      return helper.faker.address.stateAbbr();
    case "country":
      return helper.faker.address.country();
    case "countryCode":
      return helper.faker.address.countryCode();
    case "latitude":
      return helper.faker.address.latitude();
    case "longitude":
      return helper.faker.address.longitude();
    case "gender":
      return helper.faker.helpers.shuffle(["male", "female", "other"]);
    case "date":
    case "dateRecent":
      return helper.faker.date.recent();
    case "dateMiliseconds":
    case "dateRecentMiliseconds":
      return helper.faker.date.recent().getTime();
    case "datePast":
      return helper.faker.date.past();
    case "datePastMiliseconds":
      return helper.faker.date.past().getTime();
    case "dateFuture":
      return helper.faker.date.future();
    case "dateFutureMiliseconds":
      return helper.faker.date.future().getTime();
    case "dateSoon":
      return helper.faker.date.soon();
    case "dateSoonMiliseconds":
      return helper.faker.date.soon().getTime();
    case "image":
    case "avatar":
      return helper.faker.image.avatar();
    case "imageAnimal":
      return helper.faker.image.animals();
    case "imagePeople":
      return helper.faker.image.people();
    case "imageNature":
      return helper.faker.image.nature();
    case "imageTransport":
      return helper.faker.image.transport();
    case "phoneNumber":
      return helper.faker.phone.phoneNumber();
    default:
      return helper.faker.lorem.slug();
  }
}

function mockValue<T extends Model>(
  db: RealTimeDB,
  propMeta: IModelPropertyMeta<T>
) {
  if (!db || !(db instanceof RealTimeDB)) {
    const e = new Error(
      `When trying to Mock the value of "${
        propMeta.property
      }" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db} ].`
    );
    e.name = "FireModel::NotReady";
    throw e;
  }
  const helper = db.mock.getMockHelper();
  const { type, mockType } = propMeta;

  if (mockType) {
    return typeof mockType === "function"
      ? mockType(helper)
      : fakeIt(helper, mockType);
  } else {
    const namePatterns: IDictionary<string> = {
      id: "id",
      name: "name",
      fullname: "name",
      firstName: "firstName",
      lastName: "lastName",
      address: "address",
      city: "city",
      state: "stateAbbr",
      country: "countryCode",
      street: "streetAddress",
      streetAddress: "streetAddress",
      lat: "latitude",
      latitude: "latitude",
      lon: "longitude",
      longitude: "longitude",
      avatar: "avatar",
      phone: "phoneNumber",
      phoneNumber: "phoneNumber"
    };
    return fakeIt(
      helper,
      Object.keys(namePatterns).includes(propMeta.property)
        ? namePatterns[propMeta.property]
        : type
    );
  }
}

/** adds mock values for all the properties on a given model */
function mockProperties<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return async (instance: Record<T>): Promise<Record<T>> => {
    const meta = getModelMeta(instance.modelName);
    const props = instance.META ? instance.META.properties : meta.properties;

    const recProps: Partial<T> = {};
    props.map(prop => {
      const p = prop.property as keyof T;
      recProps[p] = mockValue<T>(db, prop);
    });
    const finalized: T = { ...(recProps as any), ...exceptions };

    instance = await instance.addAnother(finalized);

    return instance;
  };
}

function NumberBetween(startEnd: [number, number]) {
  return (
    Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]
  );
}

function addRelationships<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return async (instance: Record<T>): Promise<Record<T>> => {
    const meta = getModelMeta(instance.modelName);
    const relns =
      meta && meta.relationships
        ? meta.relationships
        : instance.META.relationships;
    const p = new Parallel();
    if (!relns || config.relationshipBehavior === "ignore") {
      return instance;
    }
    const follow = config.relationshipBehavior === "follow";
    relns.map(rel => {
      if (
        !config.cardinality ||
        Object.keys(config.cardinality).includes(rel.property)
      ) {
        if (rel.relType === "ownedBy") {
          const id = fbKey();
          const prop: Extract<keyof T, string> = rel.property as any;
          p.add(
            `ownedBy-${id}`,
            follow
              ? instance.setRelationship(prop, id)
              : db.set(pathJoin(instance.dbPath, prop), id)
          );
        } else {
          const cardinality = config.cardinality
            ? typeof config.cardinality[rel.property] === "number"
              ? config.cardinality[rel.property]
              : NumberBetween(config.cardinality[rel.property] as any)
            : 2;
          for (let i = 0; i < cardinality; i++) {
            const id = fbKey();
            const prop: Extract<keyof T, string> = rel.property as any;
            p.add(
              `hasMany-${id}`,
              follow
                ? instance.addToRelationship(prop, id)
                : db.set(pathJoin(instance.dbPath, prop, id), true)
            );
          }
        }
      }
    });

    await p.isDone();
    instance = await instance.reload();

    return instance;
  };
}

/** adds models to mock DB which were pointed to by original model's FKs */
function followRelationships<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return async (instance: Record<T>): Promise<Record<T>> => {
    const p = new Parallel();

    const relns = instance.META
      ? instance.META.relationships
      : getModelMeta(instance.modelName).relationships;
    if (!relns || config.relationshipBehavior !== "follow") {
      return instance;
    }

    const hasMany = relns.filter(i => i.relType === "hasMany");
    const ownedBy = relns.filter(i => i.relType === "ownedBy");
    hasMany.map(r => {
      const fks = Object.keys(instance.get(r.property as any));
      fks.map(fk => {
        p.add(fk, Mock(r.fkConstructor, db).generate(1, { id: fk }));
      });
    });
    ownedBy.map(r => {
      const fk: any = instance.get(r.property as any);
      p.add(fk, Mock(r.fkConstructor, db).generate(1, { id: fk }));
    });

    await p.isDone();
    return instance;
  };
}

function auditMocks<T extends Model>(record: Record<T>) {
  return (instance: T) => {
    if (record.META.audit === true) {
      writeAudit(
        instance.id,
        record.pluralName,
        "added",
        updateToAuditChanges(instance, {})
      );
    }

    return instance;
  };
}

export function Mock<T extends Model>(
  modelConstructor: new () => T,
  db: RealTimeDB
) {
  const record = Record.create(modelConstructor);
  const config: IMockConfig<T> = { relationshipBehavior: "ignore" };

  const API = {
    /**
     * generate
     *
     * Populates the mock database with values for a given model passed in.
     *
     * @param count how many instances of the given Model do you want?
     * @param exceptions do you want to fix a given set of properties to a static value?
     */
    async generate(count: number, exceptions?: IDictionary) {
      const props = mockProperties<T>(db, config, exceptions);
      const relns = addRelationships<T>(db, config, exceptions);
      const follow = followRelationships<T>(db, config, exceptions);
      const p = new Parallel();
      for (let i = 0; i < count; i++) {
        const rec = Record.create(modelConstructor);
        p.add(`record-${i}`, follow(await relns(await props(rec))));
      }

      await p.isDone();
    },
    /**
     * createRelationshipLinks
     *
     * Creates FK links for all the relationships in the model you are generating.
     *
     * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
     */
    createRelationshipLinks(
      cardinality?: IDictionary<[number, number] | number | true>
    ) {
      config.relationshipBehavior = "link";
      return API;
    },

    /**
     * followRelationshipLinks
     *
     * Creates FK links for all the relationships in the model you are generating; also generates
     * mocks for all the FK links.
     *
     * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
     */
    followRelationshipLinks(
      cardinality?: IDictionary<[number, number] | number | true>
    ) {
      // TODO: would like to move back to ICardinalityConfig<T> when I can figure out why Partial doesn't work
      config.relationshipBehavior = "follow";
      if (cardinality) {
        config.cardinality = cardinality;
      }
      return API;
    }
  };
  return API;
}

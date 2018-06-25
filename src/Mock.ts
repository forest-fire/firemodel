import { Model } from "./Model";
import { IDictionary } from "common-types";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Record } from "./Record";
import { arrayToHash } from "typed-conversions";
import { IModelPropertyMeta } from "./decorators/schema";
import { fbKey } from "./index";
import { set } from "lodash";
import { MockHelper } from "firemock";
import { pathJoin } from "./path";
import { getModelMeta } from "./ModelMeta";
import { writeAudit } from "./Audit";
import { updateToAuditChanges } from "./util";

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
  const path = pathJoin(record.META.dbOffset || "", record.pluralName);

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
function properties<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return (instance: T): T => {
    const modelName = instance.constructor.name.toLowerCase();

    const props = instance.META
      ? instance.META.properties
      : getModelMeta(modelName).properties;

    props.map(prop => {
      (instance as any)[prop.property] = mockValue<T>(db, prop);
    });
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
  return (instance: T): T => {
    const relns = instance.META.relationships;
    if (!relns || config.relationshipBehavior === "ignore") {
      return instance;
    }
    relns.map(rel => {
      if (
        !config.cardinality ||
        Object.keys(config.cardinality).includes(rel.property)
      ) {
        if (rel.relType === "ownedBy") {
          (instance as any)[rel.property] = fbKey();
        } else {
          const cardinality = config.cardinality
            ? typeof config.cardinality[rel.property] === "number"
              ? config.cardinality[rel.property]
              : NumberBetween(config.cardinality[rel.property] as any)
            : 2;

          (instance as any)[rel.property] = [];
          for (let i = 0; i < cardinality; i++) {
            (instance as any)[rel.property].push(fbKey());
          }
        }
      }
    });
    return instance;
  };
}

/** adds models to mock DB which were pointed to by original model's FKs */
function followRelationships<T extends Model>(
  db: RealTimeDB,
  config: IMockConfig<T>,
  exceptions: IDictionary
) {
  return (instance: T): T => {
    const relns = instance.META
      ? instance.META.relationships
      : getModelMeta(instance.constructor.name.toLowerCase()).relationships;
    if (!relns || config.relationshipBehavior !== "follow") {
      return instance;
    }

    // first add the FK's into instance
    instance = addRelationships(db, config, exceptions)(instance);
    // then iterate through the relationships
    relns.map(rel => {
      const fkConstructor = rel.fkConstructor;
      let foreignModel = new fkConstructor();
      const fkMeta: IModelPropertyMeta =
        getModelMeta(rel.fkModelName) || foreignModel.META;
      foreignModel = { ...foreignModel, ...{ META: fkMeta } };

      const fks = getRelationshipIds<T>(instance, rel as any);
      fks.map(fk => {
        // Mock the foreign model
        foreignModel = properties(db, { relationshipBehavior: "link" }, {})(
          foreignModel
        );
        // Associate the foreign model to the instance's FK
        foreignModel.id = fk;

        // Follow up with the inverse, only if inverse's model is self-reflexive
        if (
          rel.inverseProperty &&
          fkMeta.relationship(rel.inverseProperty).fkModelName ===
            instance.constructor.name.toLowerCase()
        ) {
          const inverseType = fkMeta.relationship(rel.inverseProperty).relType;

          if (inverseType === "hasMany") {
            //
          }
        }

        Record.add(fkConstructor, foreignModel);
      });
    });

    return instance;
  };
}

function getRelationshipIds<T>(
  instance: T,
  rel: IModelPropertyMeta<T>
): string[] {
  if (rel.relType === "ownedBy") {
    return [instance[rel.property]] as any;
  } else {
    return instance[rel.property] as any;
  }
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
    generate(count: number, exceptions?: IDictionary) {
      const props = properties<T>(db, config, exceptions);
      const relns = addRelationships<T>(db, config, exceptions);
      const follow = followRelationships<T>(db, config, exceptions);
      const audit = auditMocks(record);
      const records: T[] = [];
      for (let i = 0; i < count; i++) {
        const model = new modelConstructor();
        records.push(audit(follow(relns(props(model)))));
      }

      db.mock.updateDB(dbOffset(record, arrayToHash(records)));
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

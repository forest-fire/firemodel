import { Model } from "./Model";
import { IDictionary, createError } from "common-types";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Record } from "./Record";
import { Parallel } from "wait-in-parallel";
import { FireModel } from "./FireModel";
import addRelationships from "./Mock/addRelationships";
import followRelationships from "./Mock/followRelationships";
import mockProperties from "./Mock/mockProperties";

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

export function Mock<T extends Model>(
  modelConstructor: new () => T,
  db?: RealTimeDB
) {
  const config: IMockConfig<T> = { relationshipBehavior: "ignore" };
  if (!db) {
    if (FireModel.defaultDb) {
      db = FireModel.defaultDb;
    } else {
      throw createError(
        "mock/no-database",
        `You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`
      );
    }
  }

  const API = {
    /**
     * generate
     *
     * Populates the mock database with values for a given model passed in.
     *
     * @param count how many instances of the given Model do you want?
     * @param exceptions do you want to fix a given set of properties to a static value?
     */
    async generate(count: number, exceptions?: IDictionary): Promise<string[]> {
      const props = mockProperties<T>(db, config, exceptions);
      const relns = addRelationships<T>(db, config, exceptions);
      const follow = followRelationships<T>(db, config, exceptions);

      // If dynamic props then warn if it's not constrained
      // TODO: complete

      const p = new Parallel<IDictionary & { id: string }>();
      for (let i = 0; i < count; i++) {
        const rec = Record.create(modelConstructor);
        p.add(`record-${i}`, follow(await relns(await props(rec))));
      }

      const results = await p.isDone();
      return Object.keys(results).reduce(
        (prev, curr) => {
          return prev.concat(results[curr].id);
        },
        [] as string[]
      );
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

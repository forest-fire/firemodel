import { IDictionary } from "common-types";
import mockProperties from "./mockProperties";
import addRelationships from "./addRelationships";
import followRelationships from "./followRelationships";
import { Record } from "../Record";
import { Parallel } from "wait-in-parallel";
import { RealTimeDB } from "abstracted-firebase";
import { IMockConfig, IMockResponse } from "./types";

export default function API<T>(db: RealTimeDB, modelConstructor: new () => T) {
  const config: IMockConfig = {
    relationshipBehavior: "ignore",
    exceptionPassthrough: false
  };
  const MockApi = {
    /**
     * generate
     *
     * Populates the mock database with values for a given model passed in.
     *
     * @param count how many instances of the given Model do you want?
     * @param exceptions do you want to fix a given set of properties to a static value?
     */
    async generate(
      count: number,
      exceptions: IDictionary = {}
    ): Promise<IMockResponse[]> {
      const props = mockProperties<T>(db, config, exceptions);
      const relns = addRelationships<T>(db, config, exceptions);

      // If dynamic props then warn if it's not constrained
      const record = Record.create(modelConstructor);

      if (record.hasDynamicPath) {
        const notCovered = record.dynamicPathComponents.filter(
          key => !Object.keys(exceptions).includes(key)
        );

        const validMocks = ["sequence", "random"];
        notCovered.forEach(key => {
          const mock = record.META.property(key as keyof T).mockType;
          if (
            !mock ||
            (typeof mock !== "function" && !validMocks.includes(mock as string))
          ) {
            console.error(
              `The mock for the "${
                record.modelName
              }" model has dynamic segments and "${key}" was neither set as a fixed value in the exception parameter [ ${Object.keys(
                exceptions || {}
              )} ] of generate() nor was the model constrained by a @mock type ${
                mock ? `[ ${mock} ]` : ""
              } which is deemed valid. Valid named mocks are ${JSON.stringify(
                validMocks
              )}; all bespoke mocks are accepted as valid.`
            );
          }
        });
      }

      let mocks: IMockResponse[] = [];
      for (const i of Array(count)) {
        mocks = mocks.concat(await relns(await props(record)));
      }

      return mocks;
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
      return MockApi;
    },

    /**
     * Allows variation in how dynamic paths are configured on FK relationships
     */
    dynamicPathBehavior(options: string) {
      //
      return MockApi;
    },

    /** All overrides for the primary model are passed along to FK's as well */
    overridesPassThrough() {
      config.exceptionPassthrough = true;
      return MockApi;
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
      return MockApi;
    }
  };

  return MockApi;
}

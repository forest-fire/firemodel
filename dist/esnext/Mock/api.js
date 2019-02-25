import mockProperties from "./mockProperties";
import addRelationships from "./addRelationships";
import followRelationships from "./followRelationships";
import { Record } from "../Record";
import { Parallel } from "wait-in-parallel";
const config = {
    relationshipBehavior: "ignore",
    exceptionPassthrough: false
};
export default function API(db, modelConstructor) {
    const MockApi = {
        /**
         * generate
         *
         * Populates the mock database with values for a given model passed in.
         *
         * @param count how many instances of the given Model do you want?
         * @param exceptions do you want to fix a given set of properties to a static value?
         */
        async generate(count, exceptions = {}) {
            const props = mockProperties(db, config, exceptions);
            const relns = addRelationships(db, config, exceptions);
            const follow = followRelationships(db, config, exceptions);
            // If dynamic props then warn if it's not constrained
            const record = Record.create(modelConstructor);
            if (record.hasDynamicPath) {
                const notCovered = record.dynamicPathComponents.filter(key => !Object.keys(exceptions).includes(key));
                const validMocks = ["sequence", "random"];
                notCovered.forEach(key => {
                    const mock = record.META.property(key).mockType;
                    if (!mock ||
                        (typeof mock !== "function" && !validMocks.includes(mock))) {
                        console.log(`The mock for the "${record.modelName}" model has dynamic segments and "${key}" was neither set as a fixed value in the exception parameter [ ${Object.keys(exceptions || {})} ] of generate() nor was the model constrained by a @mock type ${mock ? `[ ${mock} ]` : ""} which is deemed valid: ${validMocks} or bespoke`);
                    }
                });
            }
            const p = new Parallel("Adding Mock Record(s)");
            for (let i = 0; i < count; i++) {
                // ADD MOCK RECORD
                p.add(`record-${i}`, relns(await props(record)));
            }
            const results = await p.isDone();
            return Object.keys(results).reduce((prev, curr) => {
                const response = {
                    modelName: results[curr].modelName,
                    pluralName: results[curr].pluralName,
                    id: results[curr].id,
                    compositeKey: results[curr].compositeKey,
                    dbPath: results[curr].dbPath,
                    localPath: results[curr].localPath
                };
                return prev.concat(response);
            }, []);
        },
        /**
         * createRelationshipLinks
         *
         * Creates FK links for all the relationships in the model you are generating.
         *
         * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
         */
        createRelationshipLinks(cardinality) {
            config.relationshipBehavior = "link";
            return MockApi;
        },
        /**
         * Allows variation in how dynamic paths are configured on FK relationships
         */
        dynamicPathBehavior(options) {
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
        followRelationshipLinks(cardinality) {
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
//# sourceMappingURL=api.js.map
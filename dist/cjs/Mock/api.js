"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mockProperties_1 = __importDefault(require("./mockProperties"));
const addRelationships_1 = __importDefault(require("./addRelationships"));
const Record_1 = require("../Record");
function API(db, modelConstructor) {
    const config = {
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
        async generate(count, exceptions = {}) {
            // await db.mock.importFakerLibrary();
            const props = mockProperties_1.default(db, config, exceptions);
            const relns = addRelationships_1.default(db, config, exceptions);
            // If dynamic props then warn if it's not constrained
            const record = Record_1.Record.create(modelConstructor);
            if (record.hasDynamicPath) {
                const notCovered = record.dynamicPathComponents.filter(key => !Object.keys(exceptions).includes(key));
                const validMocks = ["sequence", "random"];
                notCovered.forEach(key => {
                    const mock = record.META.property(key).mockType;
                    if (!mock ||
                        (typeof mock !== "function" && !validMocks.includes(mock))) {
                        console.error(`The mock for the "${record.modelName}" model has dynamic segments and "${key}" was neither set as a fixed value in the exception parameter [ ${Object.keys(exceptions || {})} ] of generate() nor was the model constrained by a @mock type ${mock ? `[ ${mock} ]` : ""} which is deemed valid. Valid named mocks are ${JSON.stringify(validMocks)}; all bespoke mocks are accepted as valid.`);
                    }
                });
            }
            let mocks = [];
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
exports.default = API;
//# sourceMappingURL=api.js.map
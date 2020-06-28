import { IMockResponse } from "../../types";
import { IAbstractedDatabase } from "universal-fire";
import { IDictionary } from "common-types";
export declare function MockApi<T>(db: IAbstractedDatabase, modelConstructor: new () => T): {
    /**
     * generate
     *
     * Populates the mock database with values for a given model passed in.
     *
     * @param count how many instances of the given Model do you want?
     * @param exceptions do you want to fix a given set of properties to a static value?
     */
    generate(count: number, exceptions?: Partial<T>): Promise<Array<IMockResponse<T>>>;
    /**
     * createRelationshipLinks
     *
     * Creates FK links for all the relationships in the model you are generating.
     *
     * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
     */
    createRelationshipLinks(cardinality?: IDictionary<[number, number] | number | true>): any;
    /**
     * Allows variation in how dynamic paths are configured on FK relationships
     */
    dynamicPathBehavior(options: string): any;
    /** All overrides for the primary model are passed along to FK's as well */
    overridesPassThrough(): any;
    /**
     * followRelationshipLinks
     *
     * Creates FK links for all the relationships in the model you are generating; also generates
     * mocks for all the FK links.
     *
     * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
     */
    followRelationshipLinks(cardinality?: IDictionary<[number, number] | number | true>): any;
};

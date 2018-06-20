import { Model } from "./Model";
import { IDictionary } from "common-types";
import { RealTimeDB } from "abstracted-firebase";
export declare type ICardinalityConfig<T> = {
    [key in keyof T]: [number, number] | number | true;
};
export interface IMockConfig<T> {
    relationshipBehavior: "ignore" | "link" | "follow";
    cardinality?: IDictionary<number | [number, number] | true>;
}
export declare function Mock<T extends Model>(modelConstructor: new () => T, db: RealTimeDB): {
    /**
     * generate
     *
     * Populates the mock database with values for a given model passed in.
     *
     * @param count how many instances of the given Model do you want?
     * @param exceptions do you want to fix a given set of properties to a static value?
     */
    generate(count: number, exceptions?: IDictionary<any>): void;
    /**
     * createRelationshipLinks
     *
     * Creates FK links for all the relationships in the model you are generating.
     *
     * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
     */
    createRelationshipLinks(cardinality?: IDictionary<number | true | [number, number]>): any;
    /**
     * followRelationshipLinks
     *
     * Creates FK links for all the relationships in the model you are generating; also generates
     * mocks for all the FK links.
     *
     * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
     */
    followRelationshipLinks(cardinality?: IDictionary<number | true | [number, number]>): any;
};

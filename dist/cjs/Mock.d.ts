import { Model } from "./models/Model";
import { IAbstractedDatabase } from "universal-fire";
/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
export declare function Mock<T extends Model>(modelConstructor: new () => T, db?: IAbstractedDatabase): {
    generate(count: number, exceptions?: Partial<T>): Promise<import("./Mock").IMockResponse<T>[]>;
    createRelationshipLinks(cardinality?: import("common-types").IDictionary<number | true | [number, number]>): any;
    dynamicPathBehavior(options: string): any;
    overridesPassThrough(): any;
    followRelationshipLinks(cardinality?: import("common-types").IDictionary<number | true | [number, number]>): any;
};

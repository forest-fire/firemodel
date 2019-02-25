import { Model } from "./Model";
import { RealTimeDB } from "abstracted-firebase";
export declare function Mock<T extends Model>(modelConstructor: new () => T, db?: RealTimeDB): {
    generate(count: number, exceptions?: import("common-types").IDictionary<any>): Promise<import("./Mock/types").IMockResponse[]>;
    createRelationshipLinks(cardinality?: import("common-types").IDictionary<number | true | [number, number]>): any;
    dynamicPathBehavior(options: string): any;
    overridesPassThrough(): any;
    followRelationshipLinks(cardinality?: import("common-types").IDictionary<number | true | [number, number]>): any;
};

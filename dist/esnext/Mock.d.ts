import { Model } from "./Model";
import { IDictionary } from "common-types";
import { RealTimeDB } from "abstracted-firebase";
export declare type ICardinalityConfig<T> = {
    [key in keyof T]: [number, number] | number | true;
};
export interface IMockConfig<T> {
    relationshipBehavior: "ignore" | "link" | "follow";
    cardinality?: IDictionary<ICardinalityConfig<T>>;
}
export declare function Mock<T extends Model>(modelConstructor: new () => T, db: RealTimeDB): Promise<{
    generate(count: number, exceptions: IDictionary<any>): void;
    createRelationshipLinks(cardinality?: ICardinalityConfig<T>): any;
    followRelationshipLinks(cardinality?: ICardinalityConfig<T>): any;
}>;

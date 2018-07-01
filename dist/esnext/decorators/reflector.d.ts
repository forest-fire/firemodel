import { Model } from "../Model";
import { IDictionary } from "common-types";
export interface IHasPropertyAndType {
    property: string;
    type: string;
    [key: string]: any;
}
export declare const propertyReflector: <R>(context?: IDictionary<any>, modelRollup?: IDictionary<IDictionary<R>>) => (modelKlass: Model, key: string) => void;

import { IDictionary } from "common-types";
import { Model } from "@/private";
export interface IHasPropertyAndType {
    property: string;
    type: string;
    [key: string]: any;
}
/**
 * Adds meta data to a given "property" on a model. In this
 * case we mean property to be either a strict property or
 * a relationship.
 *
 * @param context The meta information as a dictionary/hash
 * @param modelRollup a collection object which maintains
 * a dictionary of properties
 */
export declare const propertyReflector: <R>(context?: IDictionary, modelRollup?: IDictionary<IDictionary<R>>) => (modelKlass: Model, key: string) => void;

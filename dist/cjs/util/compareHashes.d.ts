import { IFmChangedProperties, IModel } from "../types";
export declare function compareHashes<T extends IModel>(from: Partial<T>, to: Partial<T>, 
/**
 * optionally explicitly state properties so that relationships
 * can be filtered away
 */
modelProps?: Array<keyof T & string>): IFmChangedProperties<T>;

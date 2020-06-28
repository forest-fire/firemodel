import "reflect-metadata";
import { IDictionary } from "common-types";
export declare function constrainedProperty(options?: IDictionary): (modelKlass: import("../@types").IModel, key: string) => void;
/** allows the introduction of a new constraint to the metadata of a property */
export declare function constrain(prop: string, value: any): (modelKlass: import("../@types").IModel, key: string) => void;
export declare function desc(value: string): (modelKlass: import("../@types").IModel, key: string) => void;
export declare function min(value: number): (modelKlass: import("../@types").IModel, key: string) => void;
export declare function max(value: number): (modelKlass: import("../@types").IModel, key: string) => void;
export declare function length(value: number): (modelKlass: import("../@types").IModel, key: string) => void;
export declare const property: (modelKlass: import("../@types").IModel, key: string) => void;
export declare const pushKey: (modelKlass: import("../@types").IModel, key: string) => void;

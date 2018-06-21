import { IModelMetaProperties } from "./decorators/schema";
import { IDictionary } from "common-types";
declare const meta: IDictionary<IModelMetaProperties>;
export declare function addModelMeta(modelName: keyof typeof meta, props: IModelMetaProperties): void;
export declare function getModelMeta(modelName: Extract<keyof typeof meta, string>): IModelMetaProperties<any>;
export declare function modelsWithMeta(): string[];
export {};

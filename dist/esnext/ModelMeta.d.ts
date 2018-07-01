import { IModelMetaProperties } from "./decorators/schema";
import { IDictionary } from "common-types";
declare const meta: IDictionary<IModelMetaProperties>;
export declare function addModelMeta(modelName: keyof typeof meta, props: IModelMetaProperties): void;
/**
 * Returns the META info for a given model, it will attempt to resolve
 * it locally first but if that is not available (as is the case with
 * self-reflexify relationships) then it will leverage the ModelMeta store
 * to get the meta information.
 *
 * @param modelKlass a model or record which exposes META property
 */
export declare function getModelMeta(modelKlass: IDictionary): Partial<IModelMetaProperties>;
export declare function modelsWithMeta(): string[];
export {};

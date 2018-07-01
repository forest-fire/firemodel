import { IModelMetaProperties, model } from "./decorators/schema";
import { IDictionary } from "common-types";

const meta: IDictionary<IModelMetaProperties> = {};

export function addModelMeta(
  modelName: keyof typeof meta,
  props: IModelMetaProperties
) {
  meta[modelName] = props;
}

export function getModelMeta(
  modelName: Extract<keyof typeof meta, string>
): Partial<IModelMetaProperties> {
  return meta[modelName] || {};
}

export function modelsWithMeta() {
  return Object.keys(meta);
}

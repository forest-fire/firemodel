import { IDictionary } from "common-types";
import { IFmModelMeta } from "@/types/index";

const meta: IDictionary<IFmModelMeta> = {};

export function addModelMeta(
  modelName: keyof typeof meta,
  props: IFmModelMeta
) {
  meta[modelName] = props;
}

/**
 * Returns the META info for a given model, it will attempt to resolve
 * it locally first but if that is not available (as is the case with
 * self-reflexify relationships) then it will leverage the ModelMeta store
 * to get the meta information.
 *
 * @param modelKlass a model or record which exposes META property
 */
export function getModelMeta(modelKlass: IDictionary): Partial<IFmModelMeta> {
  const localMeta: IFmModelMeta = modelKlass.META;
  const modelMeta: IFmModelMeta = meta[modelKlass.modelName];
  return localMeta && localMeta.properties ? localMeta : modelMeta || {};
}

export function modelsWithMeta() {
  return Object.keys(meta);
}

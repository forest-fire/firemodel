import "reflect-metadata";
import { relationshipsByModel } from "./decorator";
import { Record } from "../Record";
import { addModelMeta } from "../ModelMeta";
import { IDictionary } from "common-types";
import { propertyReflector } from "./reflector";
import { IFmModelRelationshipMeta } from "./schema";
import { Model } from "../Model";

export function inverse(inverseProperty: string) {
  return propertyReflector<IFmModelRelationshipMeta>(
    { inverseProperty },
    relationshipsByModel
  );
}

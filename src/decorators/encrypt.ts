import { FmMockType, IFmModelPropertyMeta } from "./types";
import { propertyReflector } from "./reflector";
import { propertiesByModel } from "./model-meta/property-store";

export const encrypt = propertyReflector<IFmModelPropertyMeta>(
    { encrypt: true },
    propertiesByModel
  );


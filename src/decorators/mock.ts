import { FmMockType, IFmModelPropertyMeta } from "./types";
import { propertyReflector } from "./reflector";
import { propertiesByModel } from "./model-meta/property-store";

export function mock(value: FmMockType, ...rest: any[]) {
  return propertyReflector<IFmModelPropertyMeta>(
    { mockType: value, mockParameters: rest },
    propertiesByModel
  );
}

import { FmMockType, IFmModelPropertyMeta } from "./types";
import { propertiesByModel, propertyReflector } from "@/private";

export function mock(value: FmMockType, ...rest: any[]) {
  return propertyReflector<IFmModelPropertyMeta>(
    { mockType: value, mockParameters: rest },
    propertiesByModel
  );
}

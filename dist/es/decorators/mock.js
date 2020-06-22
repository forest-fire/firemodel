import { propertyReflector } from "./reflector";
import { propertiesByModel } from "./model-meta/property-store";
export function mock(value, ...rest) {
    return propertyReflector({ mockType: value, mockParameters: rest }, propertiesByModel);
}
//# sourceMappingURL=mock.js.map
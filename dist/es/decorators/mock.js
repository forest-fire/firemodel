import { propertiesByModel, propertyReflector, } from "@/private";
export function mock(value, ...rest) {
    return propertyReflector({ mockType: value, mockParameters: rest }, propertiesByModel);
}
//# sourceMappingURL=mock.js.map
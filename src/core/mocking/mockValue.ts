import { IFmModelPropertyMeta, IModel, NamedFakes } from "@/types";
import { PropertyNamePatterns, fakeIt } from "./index";

import { IAbstractedDatabase } from "universal-fire";
import { MockHelper } from "firemock";

export function mockValue<T extends IModel>(
  db: IAbstractedDatabase,
  propMeta: IFmModelPropertyMeta<T>,
  mockHelper: MockHelper,
  ...rest: any[]
) {
  mockHelper.context = propMeta;
  const { type, mockType, mockParameters } = propMeta;

  if (mockType) {
    // MOCK is defined
    return typeof mockType === "function"
      ? mockType(mockHelper)
      : fakeIt(
          mockHelper,
          mockType as keyof typeof NamedFakes,
          ...(mockParameters || [])
        );
  } else {
    // MOCK is undefined
    const fakedMockType = (Object.keys(NamedFakes).includes(propMeta.property)
      ? PropertyNamePatterns[propMeta.property]
      : type) as keyof typeof NamedFakes;
    return fakeIt<T>(mockHelper, fakedMockType, ...(mockParameters || []));
  }
}

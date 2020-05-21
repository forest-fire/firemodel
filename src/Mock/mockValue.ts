// import { IAbstractedDatabase } from "universal-fire";
import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { MockHelper } from "firemock";
import fakeIt from "./fakeIt";
import NamedFakes from "./NamedFakes";
import PropertyNamePatterns from "./PropertyNamePatterns";
import { Model, IFmModelPropertyMeta } from "..";

export default function mockValue<T extends Model>(
  db: AbstractedDatabase,
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

import { Model, IFmModelPropertyMeta } from "..";
import { RealTimeDB } from "abstracted-firebase";
import fakeIt from "./fakeIt";
import NamedFakes from "./NamedFakes";
import PropertyNamePatterns from "./PropertyNamePatterns";
import { MockHelper } from "firemock";
import { MockError } from "../errors";

export default function mockValue<T extends Model>(
  db: RealTimeDB,
  propMeta: IFmModelPropertyMeta<T>,
  mockHelper: import("firemock").MockHelper,
  ...rest: any[]
) {
  mockHelper.context = propMeta;
  if (!db || !(db instanceof RealTimeDB)) {
    throw new MockError(
      `When trying to Mock the value of "${
        propMeta.property
      }" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${
        typeof db === "object" ? db.constructor.name : db
      } ].`
    );
  }

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

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
  ...rest: any[]
) {
  if (!db || !(db instanceof RealTimeDB)) {
    throw new MockError(
      `When trying to Mock the value of "${
        propMeta.property
      }" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${
        typeof db === "object" ? db.constructor.name : db
      } ].`
    );
  }

  const helper = new MockHelper(propMeta);
  const { type, mockType, mockParameters } = propMeta;

  if (mockType) {
    return typeof mockType === "function"
      ? mockType(helper)
      : fakeIt(helper, mockType as keyof typeof NamedFakes, mockParameters);
  } else {
    return fakeIt<T>(
      helper,
      (Object.keys(NamedFakes).includes(propMeta.property)
        ? PropertyNamePatterns[propMeta.property]
        : type) as keyof typeof NamedFakes,
      mockParameters
    );
  }
}

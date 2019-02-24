import { Model, IFmModelPropertyMeta } from "..";
import { RealTimeDB } from "abstracted-firebase";
import fakeIt from "./fakeIt";
import NamedFakes from "./NamedFakes";
import PropertyNamePatterns from "./PropertyNamePatterns";

export default function mockValue<T extends Model>(
  db: RealTimeDB,
  propMeta: IFmModelPropertyMeta<T>,
  ...rest: any[]
) {
  if (!db || !(db instanceof RealTimeDB)) {
    const e = new Error(
      `When trying to Mock the value of "${
        propMeta.property
      }" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${
        typeof db === "object" ? db.constructor.name : db
      } ].`
    );
    e.name = "FireModel::NotReady";
    throw e;
  }

  // TODO: it appears FireMock is not sending back the proper context
  // so we are overwritting as least some for now
  const helper = db.mock.getMockHelper();
  helper.context = propMeta;

  const { type, mockType, mockParameters } = propMeta;

  if (mockType) {
    return typeof mockType === "function"
      ? mockType(helper)
      : fakeIt(helper, mockType as keyof typeof NamedFakes, mockParameters);
  } else {
    return fakeIt(
      helper,
      (Object.keys(NamedFakes).includes(propMeta.property)
        ? PropertyNamePatterns[propMeta.property]
        : type) as keyof typeof NamedFakes,
      mockParameters
    );
  }
}

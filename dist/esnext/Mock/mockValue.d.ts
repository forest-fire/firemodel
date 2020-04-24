import { Model, IFmModelPropertyMeta } from "..";
import { RealTimeDB, MockHelper } from "abstracted-firebase";
export default function mockValue<T extends Model>(db: RealTimeDB, propMeta: IFmModelPropertyMeta<T>, mockHelper: MockHelper, ...rest: any[]): any;

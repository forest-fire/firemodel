import { Model, IFmModelPropertyMeta } from "..";
import { RealTimeDB } from "abstracted-firebase";
export default function mockValue<T extends Model>(db: RealTimeDB, propMeta: IFmModelPropertyMeta<T>, mockHelper: import("firemock").MockHelper, ...rest: any[]): any;

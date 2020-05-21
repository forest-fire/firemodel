import { IAbstractedDatabase } from "universal-fire";
import { MockHelper } from "firemock";
import { Model, IFmModelPropertyMeta } from "..";
export default function mockValue<T extends Model>(db: IAbstractedDatabase, propMeta: IFmModelPropertyMeta<T>, mockHelper: MockHelper, ...rest: any[]): any;

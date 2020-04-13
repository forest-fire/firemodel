import { AbstractedDatabase } from "abstracted-database";
import { Model, IFmModelPropertyMeta } from "..";
import { MockHelper } from "abstracted-firebase";
export default function mockValue<T extends Model>(db: AbstractedDatabase, propMeta: IFmModelPropertyMeta<T>, mockHelper: MockHelper, ...rest: any[]): any;

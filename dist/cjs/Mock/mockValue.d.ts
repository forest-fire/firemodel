import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { MockHelper } from "firemock";
import { Model, IFmModelPropertyMeta } from "..";
export default function mockValue<T extends Model>(db: AbstractedDatabase, propMeta: IFmModelPropertyMeta<T>, mockHelper: MockHelper, ...rest: any[]): any;

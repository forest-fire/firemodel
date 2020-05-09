import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { Model, IFmModelPropertyMeta } from "..";
export default function mockValue<T extends Model>(db: AbstractedDatabase, propMeta: IFmModelPropertyMeta<T>, mockHelper: import("firemock").MockHelper, ...rest: any[]): any;

import { IMockRelationshipConfig, Model, Record } from "@/private";
import { IAbstractedDatabase } from "universal-fire";
import { IDictionary } from "common-types";
/** adds mock values for all the properties on a given model */
export declare function mockProperties<T extends Model>(db: IAbstractedDatabase, config: IMockRelationshipConfig, exceptions: IDictionary): (record: Record<T>) => Promise<Record<T>>;

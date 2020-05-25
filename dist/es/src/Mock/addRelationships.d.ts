import { IMockRelationshipConfig, IMockResponse, Model, Record } from "@/private";
import { IAbstractedDatabase } from "universal-fire";
import { IDictionary } from "common-types";
/**
 * Adds relationships to mocked records
 */
export declare function addRelationships<T extends Model>(db: IAbstractedDatabase, config: IMockRelationshipConfig, exceptions?: IDictionary): (record: Record<T>) => Promise<Array<IMockResponse<T>>>;

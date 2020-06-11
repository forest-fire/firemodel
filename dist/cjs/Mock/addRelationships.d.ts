import { IMockRelationshipConfig, IMockResponse } from "./types";
import { IAbstractedDatabase } from "universal-fire";
import { IDictionary } from "common-types";
import { Model } from "../models/Model";
import { Record } from "../Record";
/**
 * Adds relationships to mocked records
 */
export declare function addRelationships<T extends Model>(db: IAbstractedDatabase, config: IMockRelationshipConfig, exceptions?: IDictionary): (record: Record<T>) => Promise<Array<IMockResponse<T>>>;

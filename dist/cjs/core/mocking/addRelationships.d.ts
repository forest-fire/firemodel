import { IMockRelationshipConfig, IMockResponse, IModel } from "../../@types/index";
import { IAbstractedDatabase } from "universal-fire";
import { IDictionary } from "common-types";
import { Record } from "..";
/**
 * Adds relationships to mocked records
 */
export declare function addRelationships<T extends IModel>(db: IAbstractedDatabase, config: IMockRelationshipConfig, exceptions?: IDictionary): (record: Record<T>) => Promise<Array<IMockResponse<T>>>;

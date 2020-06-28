import { IMockRelationshipConfig, IModel } from "../../@types/index";
import { IAbstractedDatabase } from "universal-fire";
import { IDictionary } from "common-types";
import { Record } from "..";
/** adds mock values for all the properties on a given model */
export declare function mockProperties<T extends IModel>(db: IAbstractedDatabase, config: IMockRelationshipConfig, exceptions: IDictionary): (record: Record<T>) => Promise<Record<T>>;

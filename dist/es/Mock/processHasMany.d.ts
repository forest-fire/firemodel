import { IMockRelationshipConfig, IMockResponse, Record } from "../private";
import { IAbstractedDatabase } from "universal-fire";
import { IFmModelRelationshipMeta } from "../@types/index";
export declare function processHasMany<T>(record: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: IAbstractedDatabase): Promise<IMockResponse<T>>;

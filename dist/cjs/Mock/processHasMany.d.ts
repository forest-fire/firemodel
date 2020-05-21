import { IMockRelationshipConfig, IMockResponse, Record, IFmModelRelationshipMeta } from "../index";
import { IAbstractedDatabase } from "universal-fire";
export declare function processHasMany<T>(record: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: IAbstractedDatabase): Promise<IMockResponse<T>>;

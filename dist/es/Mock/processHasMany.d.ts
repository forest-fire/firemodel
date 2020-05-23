import { IAbstractedDatabase } from "universal-fire";
import { IMockRelationshipConfig, IMockResponse, Record, IFmModelRelationshipMeta } from "@/private";
export declare function processHasMany<T>(record: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: IAbstractedDatabase): Promise<IMockResponse<T>>;

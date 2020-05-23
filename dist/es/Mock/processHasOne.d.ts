import { IAbstractedDatabase } from "universal-fire";
import { IMockRelationshipConfig, IMockResponse, IFmModelRelationshipMeta, Record } from "@/private";
export declare function processHasOne<T>(source: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: IAbstractedDatabase): Promise<IMockResponse<T>>;

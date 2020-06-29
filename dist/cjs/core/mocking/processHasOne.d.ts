import { IFmModelRelationshipMeta, IMockRelationshipConfig, IMockResponse } from "../../types";
import { Record } from "..";
import { IAbstractedDatabase } from "universal-fire";
export declare function processHasOne<T>(source: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: IAbstractedDatabase): Promise<IMockResponse<T>>;
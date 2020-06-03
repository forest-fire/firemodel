import { Record } from "../Record";
import { IFmModelRelationshipMeta } from "../decorators";
import { IMockRelationshipConfig, IMockResponse } from "./types";
import { IAbstractedDatabase } from "universal-fire";
export declare function processHasOne<T>(source: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: IAbstractedDatabase): Promise<IMockResponse<T>>;

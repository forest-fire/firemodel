import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { IMockRelationshipConfig, IMockResponse, Record, IFmModelRelationshipMeta } from "../index";
export declare function processHasMany<T>(record: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: AbstractedDatabase): Promise<IMockResponse<T>>;

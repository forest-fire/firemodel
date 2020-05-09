import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { Record, IFmModelRelationshipMeta } from "..";
import { IMockConfig, IMockResponse } from "./types";
export declare function processHasMany<T>(record: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockConfig, db: AbstractedDatabase): Promise<IMockResponse<T>>;

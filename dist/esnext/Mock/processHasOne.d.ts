import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { Record } from "../Record";
import { IFmModelRelationshipMeta } from "../decorators";
import { IMockRelationshipConfig, IMockResponse } from "./types";
export declare function processHasOne<T>(source: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockRelationshipConfig, db: AbstractedDatabase): Promise<IMockResponse<T>>;

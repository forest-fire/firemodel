import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { Record } from "../Record";
import { IFmModelRelationshipMeta } from "../decorators";
import { IMockConfig, IMockResponse } from "./types";
export declare function processHasOne<T>(source: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockConfig, db: AbstractedDatabase): Promise<IMockResponse<T>>;

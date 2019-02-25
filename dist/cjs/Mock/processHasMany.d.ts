import { Record, IFmModelRelationshipMeta } from "..";
import { IMockConfig, IMockResponse } from "./types";
import { RealTimeDB } from "abstracted-firebase";
export declare function processHasMany<T>(record: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockConfig, db: RealTimeDB): Promise<IMockResponse>;

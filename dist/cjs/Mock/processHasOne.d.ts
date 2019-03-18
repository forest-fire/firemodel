import { RealTimeDB } from "abstracted-firebase";
import { Record } from "../Record";
import { IFmModelRelationshipMeta } from "../decorators";
import { IMockConfig, IMockResponse } from "./types";
export declare function processHasOne<T>(source: Record<T>, rel: IFmModelRelationshipMeta<T>, config: IMockConfig, db: RealTimeDB): Promise<IMockResponse>;

import { RealTimeDB } from "abstracted-firebase";
import { IDictionary } from "common-types";
import { Model } from "../Model";
import { Record } from "../Record";
import { IMockConfig } from "./types";
export default function addRelationships<T extends Model>(db: RealTimeDB, config: IMockConfig, exceptions?: IDictionary): (record: Record<T>) => Promise<Record<T>>;

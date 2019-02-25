import { Model, Record } from "..";
import { RealTimeDB } from "abstracted-firebase";
import { IDictionary } from "common-types";
import { IMockConfig } from "./types";
/** adds models to mock DB which were pointed to by original model's FKs */
export default function followRelationships<T extends Model>(db: RealTimeDB, config: IMockConfig, exceptions?: IDictionary): (instance: Record<T>) => Promise<Record<T>>;

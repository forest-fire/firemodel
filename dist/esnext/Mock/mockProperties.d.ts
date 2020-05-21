import { Model, Record } from "..";
import { IDictionary } from "common-types";
import { IMockRelationshipConfig } from "./types";
import { AbstractedDatabase } from "@forest-fire/abstracted-database";
/** adds mock values for all the properties on a given model */
export default function mockProperties<T extends Model>(db: AbstractedDatabase, config: IMockRelationshipConfig, exceptions: IDictionary): (record: Record<T>) => Promise<Record<T>>;

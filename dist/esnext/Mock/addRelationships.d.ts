import { IDictionary } from "common-types";
import { Model } from "../models/Model";
import { Record } from "../Record";
import { IMockRelationshipConfig, IMockResponse } from "./types";
import { AbstractedDatabase } from "@forest-fire/abstracted-database";
/**
 * Adds relationships to mocked records
 */
export default function addRelationships<T extends Model>(db: AbstractedDatabase, config: IMockRelationshipConfig, exceptions?: IDictionary): (record: Record<T>) => Promise<Array<IMockResponse<T>>>;

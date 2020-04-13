import { AbstractedDatabase } from "abstracted-database";
import { IDictionary } from "common-types";
import { Model } from "../models/Model";
import { Record } from "../Record";
import { IMockConfig, IMockResponse } from "./types";
/**
 * Adds relationships to mocked records
 */
export default function addRelationships<T extends Model>(db: AbstractedDatabase, config: IMockConfig, exceptions?: IDictionary): (record: Record<T>) => Promise<IMockResponse<T>[]>;

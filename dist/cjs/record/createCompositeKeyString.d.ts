import { Model, Record } from "..";
import { IDictionary } from "common-types";
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export declare function createCompositeKeyRefFromRecord<T extends Model = Model>(rec: Record<T>): string;
/**
 * Given a hash/dictionary (with an `id` prop), will generate a "composite
 * reference" in string form.
 */
export declare function createCompositeRef(cKey: IDictionary & {
    id: string;
}): string;

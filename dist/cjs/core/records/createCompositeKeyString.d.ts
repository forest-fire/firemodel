import { IDictionary } from "common-types";
import { IModel } from "../../@types/index";
import { Record } from "..";
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export declare function createCompositeKeyRefFromRecord<T extends IModel = IModel>(rec: Record<T>): string;
/**
 * Given a hash/dictionary (with an `id` prop), will generate a "composite
 * reference" in string form.
 */
export declare function createCompositeRef(cKey: IDictionary & {
    id: string;
}): string;

import { Record } from "..";
import { FireModelError } from "../errors";
/**
 * Provides a simple API to convert to/work with **Dexie** models
 * from a **Firemodel** model definition.
 */
export class DexieModel {
    /**
     * Takes a _deconstructed_ array of model constructors and converts them into
     * a set of Dexie-compatible model definitions.
     */
    static models(...modelConstructors) {
        if (modelConstructors.length === 0) {
            throw new FireModelError(`A call to DexieModel.models() was made without passing in ANY firemodel models into it! You must at least provide one model`, "firemodel/no-models");
        }
        return modelConstructors.reduce((agg, curr) => {
            const r = Record.createWith(curr, new curr());
            const compoundIndex = r.hasDynamicPath
                ? ["id"].concat(r.dynamicPathComponents)
                : [];
            const indexes = [].concat((r.META.dbIndexes || []).filter(i => i.isIndex).map(i => i.property));
            const uniqueIndexes = ["id", "lastUpdated", "createdAt"].concat((r.META.dbIndexes || [])
                .filter(i => i.isUniqueIndex)
                .map(i => i.property));
            /**
             * A `MultiEntry` index is defined in **IndexDB** as an index which refers
             * to an Array property; because Firebase prefers _arrays_ to structured
             * as a hash/dictionary of pushkeys this type of index is less common but
             * it possible.
             *
             * [Dexie Docs](https://dexie.org/docs/MultiEntry-Index)
             */
            const multiEntryIndex = [].concat(r.META.dbIndexes.filter(i => i.isUniqueIndex).map(i => i.property));
            return agg;
        }, []);
    }
}
//# sourceMappingURL=DexieModel.js.map
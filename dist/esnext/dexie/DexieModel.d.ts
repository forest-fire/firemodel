import { IModelConstructor } from "..";
import { Model } from "../Model";
/**
 * Provides a simple API to convert to/work with **Dexie** models
 * from a **Firemodel** model definition.
 */
export declare class DexieModel {
    /**
     * Takes a _deconstructed_ array of model constructors and converts them into
     * a set of Dexie-compatible model definitions.
     */
    static models<T extends Model>(...modelConstructors: Array<IModelConstructor<T>>): string[];
}

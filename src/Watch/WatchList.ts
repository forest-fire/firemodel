import { Watch } from "../Watch";
import { Model } from "../Model";

export class WatchList<T extends Model> extends Watch<T> {
  /**
   * Provides the offsets required to build the path to a
   * LIST watcher. This includes all properties in a records
   * composite key except for the `id`
   */
  public offsets(offsetDictionary: Partial<T>) {
    //
  }
}

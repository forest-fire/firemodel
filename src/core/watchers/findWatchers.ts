import { IWatcherEventContext } from "@/types";
import { Watch } from "@/core";
import { hashToArray } from "typed-conversions";

/**
 * **findWatchers**
 *
 * Given a database path, finds all the watchers which are watching this
 * path or a parent of this path. This must consider a normal **list** or
 * **record** watcher but also a **list-of-records** where instead of a
 * `1:1` relationship between "watcher" and Firebase listener there is instead
 * a `1:M` relationship.
 */
export function findWatchers(
  /** the database path where change was detected */
  dbPath: string
) {
  const inspectListofRecords = (watcher: IWatcherEventContext) => {
    const paths = watcher.watcherPaths;
    let found = false;
    paths.forEach((p) => {
      if (dbPath.includes(p)) {
        found = true;
      }
    });
    return found;
  };

  return hashToArray(Watch.inventory).filter((i) =>
    i.watcherSource === "list-of-records"
      ? /** handles the "list-of-records" use case */
        inspectListofRecords(i)
      : /** handles the standard use case */
        dbPath.includes(i.query.path)
  );
}

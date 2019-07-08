import { Watch } from "../Watch";
import { hashToArray } from "typed-conversions";

/**
 * **findWatchers**
 *
 * Given a database path, finds all the watchers which are watching this
 * path or a parent of this path.
 */
export function findWatchers(dbPath: string) {
  return hashToArray(Watch.inventory).filter(i =>
    dbPath.includes(i.query.path as string)
  );
}

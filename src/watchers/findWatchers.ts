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
    Array.isArray(i.query)
      ? /** handles the "list-of-records" use case */
        i.query.map(p => p.path).includes(dbPath)
      : /** handles the standard use case */
        dbPath.includes(i.query.path)
  );
}

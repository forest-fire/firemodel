import { RealTimeDB } from "abstracted-firebase";
import { IDictionary } from "common-types";

export default async function cleanPredecessor(
  db: RealTimeDB,
  predecessors: string[]
) {
  let empty = false;
  let index = 1;
  while (!empty || index > predecessors.length) {
    const path = predecessors.slice(0, index).join("/");
    const result = await db.getValue<IDictionary>(path);

    if (!result || Object.keys(result).length === 0) {
      await db.remove(path);
      empty = true;
    }
    index++;
  }
}

import { RealTimeDB } from "abstracted-firebase";
import { Record } from "../Record";
import { IFmModelRelationshipMeta } from "../decorators";
import { IMockConfig, IMockResponse } from "./types";
import { Mock } from "../Mock";
import { Parallel } from "wait-in-parallel";

export async function processHasOne<T>(
  source: Record<T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockConfig,
  db: RealTimeDB
): Promise<IMockResponse> {
  const fkMock = Mock(rel.fkConstructor(), db);
  const fkMockMeta = (await fkMock.generate(1)).pop();
  console.log(fkMockMeta);

  const p = new Parallel(
    `Adding hasOne for ${rel.property} on ${source.modelName} to ${
      fkMockMeta.modelName
    }`
  );

  const prop: Extract<keyof T, string> = rel.property as any;
  p.add(
    `hasOne-${fkMockMeta.id}-${source.modelName}-${prop}`,
    source.setRelationship(prop, fkMockMeta.compositeKey)
  );

  // if (config.relationshipBehavior === "link") {
  //   p.add(
  //     `hasOne-remove-fk-${fkMockMeta.id}-${fkMockMeta.modelName}`,
  //     db.remove(fkMockMeta.dbPath.replace(fkMockMeta.id, ""))
  //   );

  //   const predecessors = fkMockMeta.dbPath
  //     .replace(fkMockMeta.id, "")
  //     .split("/")
  //     .filter(i => i);
  //   p.add("cleaning-predecessors", cleanPredecessor(db, predecessors));
  // }

  const result = await p.isDone();
  return fkMockMeta;
}

import { RealTimeDB } from "abstracted-firebase";
import { Record } from "../Record";
import { IFmModelRelationshipMeta } from "../decorators";
import { IMockConfig, IMockResponse } from "./types";
import { Mock } from "../Mock";
import { Parallel } from "wait-in-parallel";
import cleanPredecessor from "./cleanPredecessor";

export async function processHasOne<T>(
  source: Record<T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockConfig,
  db: RealTimeDB
): Promise<IMockResponse> {
  const fkMock = Mock(rel.fkConstructor(), db);
  const fkMockMeta = (await fkMock.generate(1)).pop();
  const prop: Extract<keyof T, string> = rel.property as any;

  source.setRelationship(prop, fkMockMeta.compositeKey);

  if (config.relationshipBehavior === "link") {
    const predecessors = fkMockMeta.dbPath
      .replace(fkMockMeta.id, "")
      .split("/")
      .filter(i => i);
    // console.log(predecessors);
    await db.remove(fkMockMeta.dbPath);
  }

  return fkMockMeta;
}

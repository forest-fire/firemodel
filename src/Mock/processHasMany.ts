import { Mock, Record, IFmModelRelationshipMeta } from "..";
import { IMockConfig, IMockResponse } from "./types";
import { RealTimeDB } from "abstracted-firebase";

export async function processHasMany<T>(
  record: Record<T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockConfig,
  db: RealTimeDB
): Promise<IMockResponse<T>> {
  const fkMockMeta = (await Mock(rel.fkConstructor(), db).generate(1)).pop();
  const prop: Extract<keyof T, string> = rel.property as any;

  await record.addToRelationship(prop, fkMockMeta.compositeKey);
  if (config.relationshipBehavior === "link") {
    await db.remove(fkMockMeta.dbPath);
    return;
  }

  return fkMockMeta;
}

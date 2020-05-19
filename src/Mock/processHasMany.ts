import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import {
  IMockRelationshipConfig,
  IMockResponse,
  Mock,
  Record,
  IFmModelRelationshipMeta,
} from "../index";

export async function processHasMany<T>(
  record: Record<T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockRelationshipConfig,
  db: AbstractedDatabase
): Promise<IMockResponse<T>> {
  // by creating a mock we are giving any dynamic path segments
  // an opportunity to be mocked (this is best practice)
  const fkMockMeta = (await Mock(rel.fkConstructor(), db).generate(1)).pop();
  const prop: Extract<keyof T, string> = rel.property as any;

  await record.addToRelationship(prop, fkMockMeta.compositeKey);
  if (config.relationshipBehavior === "link") {
    await db.remove(fkMockMeta.dbPath);
    return;
  }

  return fkMockMeta;
}

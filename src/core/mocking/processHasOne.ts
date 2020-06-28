import {
  IFmModelRelationshipMeta,
  IMockRelationshipConfig,
  IMockResponse,
} from "@/types";
import { Mock, Record } from "@/core";

import { IAbstractedDatabase } from "universal-fire";

export async function processHasOne<T>(
  source: Record<T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockRelationshipConfig,
  db: IAbstractedDatabase
): Promise<IMockResponse<T>> {
  const fkMock = Mock(rel.fkConstructor(), db);
  const fkMockMeta = (await fkMock.generate(1)).pop();
  const prop: Extract<keyof T, string> = rel.property as any;

  source.setRelationship(prop, fkMockMeta.compositeKey);

  if (config.relationshipBehavior === "link") {
    const predecessors = fkMockMeta.dbPath
      .replace(fkMockMeta.id, "")
      .split("/")
      .filter((i) => i);

    await db.remove(fkMockMeta.dbPath);
  }

  return fkMockMeta;
}

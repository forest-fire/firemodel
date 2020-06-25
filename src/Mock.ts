import { FireModel, FireModelError, Model, Record } from "@/private";

import { IAbstractedDatabase } from "universal-fire";
import { MockApi } from "./Mock/MockApi";

function defaultCardinality<T>(r: Record<T>) {
  return r.META.relationships.reduce((prev, curr) => {
    prev = { ...prev, [curr.property]: true };
  }, {} as any);
}

/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
export function Mock<T extends Model>(
  modelConstructor: new () => T,
  db?: IAbstractedDatabase
) {
  if (!db) {
    if (FireModel.defaultDb) {
      db = FireModel.defaultDb;
    } else {
      throw new FireModelError(
        `You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`,
        "mock/no-database"
      );
    }
  }

  if (!db.isMockDb) {
    console.warn(
      "You are using Mock() with a real database; typically a mock database is preferred"
    );
  }

  return MockApi<T>(db, modelConstructor);
}

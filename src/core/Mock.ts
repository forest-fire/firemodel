import { FireModel, IMockOptions } from "@/core";

import { FireModelError } from "@/errors";
import { IAbstractedDatabase } from "universal-fire";
import { IModel } from "@/types";
import { MockApi } from "./mocking/MockApi";
import { capitalize } from "@/util";

/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
export function Mock<T extends IModel>(
  modelConstructor: new () => T,
  db: IAbstractedDatabase | undefined = undefined,
  options: IMockOptions = {}
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

  if (!db.isMockDb && !options.allowRealDatabase) {
    throw new FireModelError(
      `You are using Mock(${capitalize(
        modelConstructor.name
      )}) with a real database; typically a mock database is preferred`
    );
  }

  return new MockApi<T>(db, modelConstructor);
}

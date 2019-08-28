import { Model } from "./Model";
import { createError } from "common-types";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Record } from "./Record";
import { FireModel } from "./FireModel";
import API from "./Mock/api";
import { FireModelError } from "./errors";

function defaultCardinality<T>(r: Record<T>) {
  return r.META.relationships.reduce(
    (prev, curr) => {
      prev = { ...prev, [curr.property]: true };
    },
    {} as any
  );
}

/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
export function Mock<T extends Model>(
  modelConstructor: new () => T,
  db?: RealTimeDB
) {
  if (!db) {
    if (FireModel.defaultDb) {
      db = FireModel.defaultDb;
    } else {
      throw createError(
        "mock/no-database",
        `You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`
      );
    }
  }

  if (!db.isMockDb) {
    throw new FireModelError(
      `When calling the Mock() function you provide a "mock database" not a live Firebase DB! ${
        db === FireModel.defaultDb
          ? "Note: the db connection was taken from the default FireModel database, if that's not what you intended you can explicitly pass in the DB in the call to Mock() as the second parameter."
          : ""
      }`,
      "firemodel/not-mock-db"
    );
  }

  return API<T>(db, modelConstructor);
}

import { FireModel } from "./FireModel";
import API from "./Mock/api";
import { FireModelError } from "./errors";
function defaultCardinality(r) {
    return r.META.relationships.reduce((prev, curr) => {
        prev = Object.assign(Object.assign({}, prev), { [curr.property]: true });
    }, {});
}
/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
export function Mock(modelConstructor, db) {
    if (!db) {
        if (FireModel.defaultDb) {
            db = FireModel.defaultDb;
        }
        else {
            throw new FireModelError(`You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`, "mock/no-database");
        }
    }
    if (!db.isMockDb) {
        console.warn("You are using Mock() with a real database; typically a mock database is preferred");
    }
    return API(db, modelConstructor);
}
//# sourceMappingURL=Mock.js.map
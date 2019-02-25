import { createError } from "common-types";
import { FireModel } from "./FireModel";
import API from "./Mock/api";
function defaultCardinality(r) {
    return r.META.relationships.reduce((prev, curr) => {
        prev = Object.assign({}, prev, { [curr.property]: true });
    }, {});
}
export function Mock(modelConstructor, db) {
    if (!db) {
        if (FireModel.defaultDb) {
            db = FireModel.defaultDb;
        }
        else {
            throw createError("mock/no-database", `You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`);
        }
    }
    if (!db.isMockDb) {
        throw createError("mock/not-mock-db", `When calling the Mock() function you provide a "mock database" not a live Firebase DB! ${db === FireModel.defaultDb
            ? "Note: the db connection was taken from the default FireModel database, if that's not what you intended you can explicitly pass in the DB in the call to Mock() as the second parameter."
            : ""}`);
    }
    return API(db, modelConstructor);
}
//# sourceMappingURL=Mock.js.map
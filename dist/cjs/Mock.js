"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const FireModel_1 = require("./FireModel");
const api_1 = require("./Mock/api");
function defaultCardinality(r) {
    return r.META.relationships.reduce((prev, curr) => {
        prev = Object.assign({}, prev, { [curr.property]: true });
    }, {});
}
function Mock(modelConstructor, db) {
    if (!db) {
        if (FireModel_1.FireModel.defaultDb) {
            db = FireModel_1.FireModel.defaultDb;
        }
        else {
            throw common_types_1.createError("mock/no-database", `You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`);
        }
    }
    if (!db.isMockDb) {
        throw common_types_1.createError("mock/not-mock-db", `When calling the Mock() function you provide a "mock database" not a live Firebase DB! ${db === FireModel_1.FireModel.defaultDb
            ? "Note: the db connection was taken from the default FireModel database, if that's not what you intended you can explicitly pass in the DB in the call to Mock() as the second parameter."
            : ""}`);
    }
    return api_1.default(db, modelConstructor);
}
exports.Mock = Mock;
//# sourceMappingURL=Mock.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mock = void 0;
const FireModel_1 = require("./FireModel");
const api_1 = __importDefault(require("./Mock/api"));
const errors_1 = require("./errors");
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
function Mock(modelConstructor, db) {
    if (!db) {
        if (FireModel_1.FireModel.defaultDb) {
            db = FireModel_1.FireModel.defaultDb;
        }
        else {
            throw new errors_1.FireModelError(`You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`, "mock/no-database");
        }
    }
    if (!db.isMockDb) {
        console.warn("You are using Mock() with a real database; typically a mock database is preferred");
    }
    return api_1.default(db, modelConstructor);
}
exports.Mock = Mock;
//# sourceMappingURL=Mock.js.map
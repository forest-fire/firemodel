"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var hasMany_1 = require("./hasMany");
exports.hasMany = hasMany_1.hasMany;
var hasOne_1 = require("./hasOne");
exports.belongsTo = hasOne_1.belongsTo;
exports.hasOne = hasOne_1.hasOne;
exports.ownedBy = hasOne_1.ownedBy;
var indexing_1 = require("./indexing");
exports.index = indexing_1.index;
exports.uniqueIndex = indexing_1.uniqueIndex;
exports.getDbIndexes = indexing_1.getDbIndexes;
__export(require("./constraints"));
__export(require("./model"));
__export(require("./defaultValue"));
__export(require("./OneWay"));
__export(require("./mock"));
//# sourceMappingURL=index.js.map
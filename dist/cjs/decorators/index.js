"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var hasMany_1 = require("./hasMany");
exports.hasMany = hasMany_1.hasMany;
var belongsTo_1 = require("./belongsTo");
exports.belongsTo = belongsTo_1.belongsTo;
exports.hasOne = belongsTo_1.hasOne;
exports.ownedBy = belongsTo_1.ownedBy;
var indexing_1 = require("./indexing");
exports.index = indexing_1.index;
exports.uniqueIndex = indexing_1.uniqueIndex;
__export(require("./constraints"));
__export(require("./schema"));
//# sourceMappingURL=index.js.map
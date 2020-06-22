"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipCardinality = exports.RelationshipPolicy = void 0;
var RelationshipPolicy;
(function (RelationshipPolicy) {
    RelationshipPolicy["keys"] = "keys";
    RelationshipPolicy["lazy"] = "lazy";
    RelationshipPolicy["inline"] = "inline";
})(RelationshipPolicy = exports.RelationshipPolicy || (exports.RelationshipPolicy = {}));
var RelationshipCardinality;
(function (RelationshipCardinality) {
    RelationshipCardinality["hasMany"] = "hasMany";
    RelationshipCardinality["belongsTo"] = "belongsTo";
})(RelationshipCardinality = exports.RelationshipCardinality || (exports.RelationshipCardinality = {}));
//# sourceMappingURL=general.js.map
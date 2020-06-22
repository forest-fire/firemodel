"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHasManyRelationship = void 0;
function isHasManyRelationship(rec, property) {
    return rec.META.relationship(property).relType === "hasMany" ? true : false;
}
exports.isHasManyRelationship = isHasManyRelationship;
//# sourceMappingURL=isHasManyRelationship.js.map
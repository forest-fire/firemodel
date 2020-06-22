export function isHasManyRelationship(rec, property) {
    return rec.META.relationship(property).relType === "hasMany" ? true : false;
}
//# sourceMappingURL=isHasManyRelationship.js.map
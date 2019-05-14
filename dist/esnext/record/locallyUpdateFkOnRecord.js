/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 */
export function locallyUpdateFkOnRecord(rec, op, prop, id) {
    const relnType = rec.META.relationship(prop).relType;
    // update lastUpdated but quietly as it will be updated again
    // once server responds
    rec.set("lastUpdated", new Date().getTime(), true);
    // now work on a per-op basis
    switch (op) {
        case "set":
        case "add":
            rec._data[prop] =
                relnType === "hasMany" ? Object.assign({}, rec.data[prop], { [id]: true }) : id;
            return;
        case "remove":
            if (relnType === "hasMany") {
                delete rec._data[prop][id];
            }
            else {
                rec._data[prop] = "";
            }
            return;
    }
}
//# sourceMappingURL=locallyUpdateFkOnRecord.js.map
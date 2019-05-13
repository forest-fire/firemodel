/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 */
export function locallyUpdateFkOnRecord(rec, op, prop, id) {
    const relnType = rec.META.relationship(prop).relType;
    switch (op) {
        case "set":
        case "add":
            rec._data[prop] =
                relnType === "hasMany" ? Object.assign({}, rec.data[prop], { [id]: true }) : id;
        case "remove":
            if (relnType === "hasMany") {
                delete rec._data[prop];
            }
            else {
                rec._data[prop] = "";
            }
    }
}
//# sourceMappingURL=locallyUpdateFkOnRecord.js.map
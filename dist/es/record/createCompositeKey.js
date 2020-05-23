"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const util_1 = require("../util");
/**
 * Given a `Record` which defines all properties in it's
 * "dynamic segments" as well as an `id`; this function returns
 * an object representation of the composite key.
 */
function createCompositeKey(rec) {
    const model = rec.data;
    if (!rec.id) {
        throw new errors_1.FireModelError(`You can not create a composite key without first setting the 'id' property!`, "firemodel/not-ready");
    }
    const dynamicPathComponents = rec.dynamicPathComponents.reduce((prev, key) => {
        if (!model[key]) {
            throw new errors_1.FireModelError(`You can not create a composite key on a ${util_1.capitalize(rec.modelName)} without first setting the '${key}' property!`, "firemodel/not-ready");
        }
        return {
            ...prev,
            ...{ [key]: model[key] }
        };
    }, {});
    return rec.dynamicPathComponents.reduce((prev, key) => ({
        ...prev,
        ...dynamicPathComponents
    }), { id: rec.id });
}
exports.createCompositeKey = createCompositeKey;
//# sourceMappingURL=createCompositeKey.js.map
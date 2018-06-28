"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const decorator_1 = require("./decorator");
function constrainedProperty(options = {}) {
    return decorator_1.propertyDecorator(Object.assign({}, options, { isRelationship: false, isProperty: true }), "property");
}
exports.constrainedProperty = constrainedProperty;
/** allows the introduction of a new constraint to the metadata of a property */
function constrain(prop, value) {
    return decorator_1.propertyDecorator({ [prop]: value });
}
exports.constrain = constrain;
function desc(value) {
    return decorator_1.propertyDecorator({ desc: value });
}
exports.desc = desc;
function min(value) {
    return decorator_1.propertyDecorator({ min: value });
}
exports.min = min;
function mock(value) {
    return decorator_1.propertyDecorator({ mockType: value });
}
exports.mock = mock;
function max(value) {
    return decorator_1.propertyDecorator({ max: value });
}
exports.max = max;
function length(value) {
    return decorator_1.propertyDecorator({ length: value });
}
exports.length = length;
exports.property = decorator_1.propertyDecorator({
    isRelationship: false,
    isProperty: true
}, "property");
exports.pushKey = decorator_1.propertyDecorator({
    pushKey: true
}, "property");
//# sourceMappingURL=property.js.map
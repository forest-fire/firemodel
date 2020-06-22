"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyReflector = void 0;
const get_value_1 = __importDefault(require("get-value"));
const set_value_1 = __importDefault(require("set-value"));
const util_1 = require("../util");
function push(target, path, value) {
    set_value_1.default(target, path, value);
}
/**
 * Adds meta data to a given "property" on a model. In this
 * case we mean property to be either a strict property or
 * a relationship.
 *
 * @param context The meta information as a dictionary/hash
 * @param modelRollup a collection object which maintains
 * a dictionary of properties
 */
exports.propertyReflector = (context = {}, 
/**
 * if you want this to be rollup up as an dictionary by prop;
 * to be exposed in the model (or otherwise)
 */
modelRollup) => (modelKlass, key) => {
    const modelName = modelKlass.constructor.name;
    const reflect = Reflect.getMetadata("design:type", modelKlass, key) || {};
    const meta = Object.assign(Object.assign(Object.assign(Object.assign({}, (Reflect.getMetadata(key, modelKlass) || {})), { type: util_1.lowercase(reflect.name) }), context), { property: key });
    Reflect.defineMetadata(key, meta, modelKlass);
    if (modelRollup) {
        const modelAndProp = modelName + "." + key;
        set_value_1.default(modelRollup, modelAndProp, Object.assign(Object.assign({}, get_value_1.default(modelRollup, modelAndProp)), meta));
    }
};
//# sourceMappingURL=reflector.js.map
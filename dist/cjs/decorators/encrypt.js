"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = void 0;
const reflector_1 = require("./reflector");
const property_store_1 = require("./model-meta/property-store");
exports.encrypt = reflector_1.propertyReflector({ encrypt: true }, property_store_1.propertiesByModel);
//# sourceMappingURL=encrypt.js.map
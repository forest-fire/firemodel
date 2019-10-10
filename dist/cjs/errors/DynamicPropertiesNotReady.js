"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireModelError_1 = require("./FireModelError");
class DynamicPropertiesNotReady extends FireModelError_1.FireModelError {
    constructor(rec, message) {
        message = message
            ? message
            : `An attempt to interact with the record ${rec.modelName} in a way that requires that the fully composite key be specified. The required parameters for this model to be ready for this are: ${rec.dynamicPathComponents.join(", ")}.`;
        super(message, "firemodel/dynamic-properties-not-ready");
    }
}
exports.DynamicPropertiesNotReady = DynamicPropertiesNotReady;
//# sourceMappingURL=DynamicPropertiesNotReady.js.map
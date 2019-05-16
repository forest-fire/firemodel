"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FireModelError extends Error {
    constructor(message, name = "firemodel/error") {
        super(message);
        this.firemodel = true;
        this.name = name;
        this.code = name.split("/").pop();
    }
}
exports.FireModelError = FireModelError;
//# sourceMappingURL=FireModelError.js.map
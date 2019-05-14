"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class FireModelProxyError extends _1.FireModelError {
    constructor(e, context = "", name = "") {
        super("", !name ? `firemodel/${e.name}` : name);
        this.firemodel = true;
        this.originalError = e;
        this.message = context ? `${context}. ${e.message}.` : e.message;
    }
}
exports.FireModelProxyError = FireModelProxyError;
//# sourceMappingURL=FireModelProxyError.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base **Error** for **FireModel**. Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
class FireModelError extends Error {
    constructor(message, classification = "firemodel/error") {
        super(message);
        this.firemodel = true;
        const parts = classification.split("/");
        console.log(parts);
        const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}
exports.FireModelError = FireModelError;
//# sourceMappingURL=FireModelError.js.map
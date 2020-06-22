"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownRelationshipProblem = void 0;
const FireModelError_1 = require("../FireModelError");
class UnknownRelationshipProblem extends FireModelError_1.FireModelError {
    constructor(err, rec, property, operation = "n/a", whileDoing) {
        const message = `An unexpected error occurred while working with a "${operation}" operation on ${rec.modelName}::${property}. ${whileDoing
            ? `This error was encounted while working on ${whileDoing}. `
            : ""}The error reported was [${err.name}]: ${err.message}`;
        super(message, "firemodel/unknown-relationship-problem");
        this.stack = err.stack;
    }
}
exports.UnknownRelationshipProblem = UnknownRelationshipProblem;
//# sourceMappingURL=UnknownRelationshipProblem.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireModelError_1 = require("../FireModelError");
class DecoratorProblem extends FireModelError_1.FireModelError {
    constructor(decorator, e, context) {
        super("", "firemodel/decorator-problem");
        const errText = typeof e === "string" ? e : e.message;
        this.message = `There was a problem in the "${decorator}" decorator. ${errText}\n${context}`;
    }
}
exports.DecoratorProblem = DecoratorProblem;
//# sourceMappingURL=DecoratorProblem.js.map
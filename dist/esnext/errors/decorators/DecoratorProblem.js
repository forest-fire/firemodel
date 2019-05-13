import { FireModelError } from "../FireModelError";
export class DecoratorProblem extends FireModelError {
    constructor(decorator, e, context) {
        super("", "firemodel/decorator-problem");
        const errText = typeof e === "string" ? e : e.message;
        this.message = `There was a problem in the "${decorator}" decorator. ${errText}\n${context}`;
    }
}
//# sourceMappingURL=DecoratorProblem.js.map
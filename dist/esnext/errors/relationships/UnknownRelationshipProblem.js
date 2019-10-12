import { FireModelError } from "../FireModelError";
export class UnknownRelationshipProblem extends FireModelError {
    constructor(err, rec, property, operation = "n/a", whileDoing) {
        const message = `An unexpected error occurred while working with a "${operation}" operation on ${rec.modelName}::${property}. ${whileDoing
            ? `This error was encounted while working on ${whileDoing}. `
            : ""}The error reported was [${err.name}]: ${err.message}`;
        super(message, "firemodel/unknown-relationship-problem");
        this.stack = err.stack;
    }
}
//# sourceMappingURL=UnknownRelationshipProblem.js.map
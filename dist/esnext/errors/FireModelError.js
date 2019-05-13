export class FireModelError extends Error {
    constructor(message, code = "firemodel/error") {
        super();
        this.code = code;
        this.firemodel = true;
        this.name = code.split("/").pop();
    }
}
//# sourceMappingURL=FireModelError.js.map
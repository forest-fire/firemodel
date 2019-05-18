export class FireModelError extends Error {
    constructor(message, name = "firemodel/error") {
        super(message);
        this.firemodel = true;
        this.name = name;
        this.code = name.split("/").pop();
    }
}
//# sourceMappingURL=FireModelError.js.map
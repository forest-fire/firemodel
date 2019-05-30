/**
 * Base **Error** for **FireModel**. Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
export class FireModelError extends Error {
    constructor(message, classification = "firemodel/error") {
        super(message);
        this.firemodel = true;
        const [type, subType] = classification.split("/");
        this.name = subType ? `${type}/${subType}` : `firemodel/${subType}`;
        this.code = subType ? subType : type;
    }
}
//# sourceMappingURL=FireModelError.js.map
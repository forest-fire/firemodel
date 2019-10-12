import { FireModelError } from ".";
export class FireModelProxyError extends FireModelError {
    constructor(e, context = "", name = "") {
        super("", !name ? `firemodel/${e.name}` : name);
        this.firemodel = true;
        this.originalError = e;
        this.message = context ? `${context}. ${e.message}.` : e.message;
        this.stack = e.stack;
    }
}
//# sourceMappingURL=FireModelProxyError.js.map
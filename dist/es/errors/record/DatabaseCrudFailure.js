import { FireModelError } from "../FireModelError";
import { capitalize } from "../../util";
export class RecordCrudFailure extends FireModelError {
    constructor(rec, crudAction, transactionId, e) {
        super("", e.name !== "Error" ? e.name : `firemodel/record-${crudAction}-failure`);
        const message = `Attempt to "${crudAction}" "${capitalize(rec.modelName)}::${rec.id}" failed [ ${transactionId} ] ${e ? e.message : "for unknown reasons"}`;
        this.message = message;
        this.stack = e.stack;
    }
}
//# sourceMappingURL=DatabaseCrudFailure.js.map
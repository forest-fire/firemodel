import { Record } from "../..";
import { capitalize } from "../../util";
export function sendRelnDispatchEvent(type, event) {
    const fkModel = Record.create(rec.META.relationship(property).fkConstructor());
    let payload = {
        type,
        transactionId,
        operation,
        from: capitalize(rec.modelName),
        to: capitalize(fkModel.modelName),
        paths,
        fromLocal: rec.localPath,
        toLocal: fkModel.localPath,
        value: Object.assign({}, rec.data)
    };
    if (err) {
        payload = Object.assign({}, payload, {
            errCode: err.code || err.name,
            errMessage: err.message
        });
    }
    rec.dispatch(payload);
}
//# sourceMappingURL=sendRelnDispatchEvent.js.map
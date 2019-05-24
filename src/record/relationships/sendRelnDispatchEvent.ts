import { Model, Record } from "../..";
import { FmEvents } from "../../state-mgmt";
import { IFmPathValuePair, IFmRelationshipOperation } from "../../@types";
import { capitalize } from "../../util";
import { FireModelError } from "../../errors";

export function sendRelnDispatchEvent<T extends Model>(
  type: FmEvents,
  transactionId: string,
  operation: IFmRelationshipOperation,
  rec: Record<T>,
  property: keyof T,
  paths: IFmPathValuePair[],
  err?: FireModelError
) {
  const fkModel = Record.create(
    rec.META.relationship(property).fkConstructor()
  );
  let payload = {
    type,
    transactionId,
    operation,
    from: capitalize(rec.modelName),
    to: capitalize(fkModel.modelName),
    paths,
    fromLocal: rec.localPath,
    toLocal: fkModel.localPath,
    value: { ...rec.data }
  };

  if (err) {
    payload = {
      ...payload,
      ...{
        errCode: err.code || err.name,
        errMessage: err.message
      }
    };
  }

  rec.dispatch(payload);
}

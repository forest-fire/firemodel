import { Model, Record } from "@/core";

import { FireModelError } from "@errors";
import { IFmCrudOperation } from "@types";
import { capitalize } from "@/util";

export class RecordCrudFailure<T extends Model> extends FireModelError {
  constructor(
    rec: Record<T>,
    crudAction: IFmCrudOperation,
    transactionId: string,
    e?: Error
  ) {
    super(
      "",
      e.name !== "Error" ? e.name : `firemodel/record-${crudAction}-failure`
    );
    const message = `Attempt to "${crudAction}" "${capitalize(
      rec.modelName
    )}::${rec.id}" failed [ ${transactionId} ] ${
      e ? e.message : "for unknown reasons"
    }`;
    this.message = message;
    this.stack = e.stack;
  }
}

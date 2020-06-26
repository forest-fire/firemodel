import { Model, Record } from "@/core";

import { FireModelError } from "@errors";
import { IFmRelationshipOperation } from "@types";

export class UnknownRelationshipProblem<
  T extends Model
> extends FireModelError {
  constructor(
    err: Error,
    rec: Record<T>,
    property: keyof T,
    operation: IFmRelationshipOperation | "n/a" = "n/a",
    whileDoing?: string
  ) {
    const message = `An unexpected error occurred while working with a "${operation}" operation on ${
      rec.modelName
    }::${property}. ${
      whileDoing
        ? `This error was encounted while working on ${whileDoing}. `
        : ""
    }The error reported was [${err.name}]: ${err.message}`;
    super(message, "firemodel/unknown-relationship-problem");
    this.stack = err.stack;
  }
}

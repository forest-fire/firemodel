import { FireModelError } from "@/errors";
import { IFmRelationshipOperation } from "@/types";
import { IModel } from "@/types";
import { Record } from "@/core";

export class UnknownRelationshipProblem<
  T extends IModel
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

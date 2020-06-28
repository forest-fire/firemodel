import { FireModelError } from "@/errors";
import { IDictionary } from "common-types";

export class DecoratorProblem extends FireModelError {
  constructor(decorator: string, e: Error | string, context?: IDictionary) {
    super("", "firemodel/decorator-problem");
    const errText = typeof e === "string" ? e : e.message;
    this.message = `There was a problem in the "${decorator}" decorator. ${errText}\n${context}`;
  }
}

import { FireModelError } from "@/errors";

export class FireModelProxyError extends FireModelError {
  public firemodel = true;
  public code: string;
  public originalError: Error | FireModelError;
  constructor(
    e: Error | FireModelError,
    context: string = "",
    name: string = ""
  ) {
    super("", !name ? `firemodel/${e.name}` : name);

    this.originalError = e;
    this.message = context ? `${context}.\n\n${e.message}.` : e.message;
    this.stack = e.stack;
  }
}

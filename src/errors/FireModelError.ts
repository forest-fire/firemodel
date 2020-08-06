import { IUnderlyingError } from "@/types";

/**
 * Base **Error** for **FireModel**. Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
export class FireModelError<T = any> extends Error {
  public firemodel = true;
  public code: string;
  /**
   * In cases where more than one error has occurred you can add the underlying
   * errors to this array of errors. Optionally you may also wrap the errors into
   */
  public errors?: IUnderlyingError<T>[];
  constructor(
    message: string,
    classification: string = "firemodel/error",
    underlyingErrors?: IUnderlyingError<T>[]
  ) {
    super(message);
    const parts = classification.split("/");
    const [type, subType] =
      parts.length === 1 ? ["firemodel", parts[0]] : parts;
    this.name = `${type}/${subType}`;
    this.code = subType;
    if (underlyingErrors) {
      this.errors = underlyingErrors;
    }
  }
}

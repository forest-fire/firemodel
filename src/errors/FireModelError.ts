/**
 * Base **Error** for **FireModel**. Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
export class FireModelError extends Error {
  public firemodel = true;
  public code: string;
  constructor(message: string, classification: string = "firemodel/error") {
    super(message);
    const parts = classification.split("/");
    const [type, subType] =
      parts.length === 1 ? ["firemodel", parts[0]] : parts;
    this.name = `${type}/${subType}`;
    this.code = subType;
  }
}

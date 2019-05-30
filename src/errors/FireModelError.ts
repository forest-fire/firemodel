/**
 * Base **Error** for **FireModel**. Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
export class FireModelError extends Error {
  public firemodel = true;
  public code: string;
  constructor(message: string, classification: string = "firemodel/error") {
    super(message);
    const [type, subType] = classification.split("/");
    this.name = subType ? `${type}/${subType}` : `firemodel/${subType}`;
    this.code = subType ? subType : type;
  }
}

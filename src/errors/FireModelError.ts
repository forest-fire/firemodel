export class FireModelError extends Error {
  public firemodel = true;
  public code: string;
  constructor(message: string, name: string = "firemodel/error") {
    super();
    this.name = name;
    this.code = name.split("/").pop();
  }
}

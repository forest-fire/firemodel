export class FireModelError extends Error {
  public firemodel = true;
  public code: string;
  constructor(message: string, name: string = "firemodel/error") {
    super(message);
    this.name = name;
    this.code = name.split("/").pop();
  }
}
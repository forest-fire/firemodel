export class FireModelError extends Error {
  constructor(message: string, public code: string = "firemodel/error") {
    super();
    this.name = code.split("/").pop();
  }
}

/**
 * A mocking error originated within FireModel
 */
export class MockError extends Error {
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

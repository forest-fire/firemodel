/**
 * A mocking error originated within FireModel
 */
export class MockError extends Error {
    constructor(message, classification = "firemodel/error") {
        super(message);
        this.firemodel = true;
        const parts = classification.split("/");
        const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}
//# sourceMappingURL=MockError.js.map
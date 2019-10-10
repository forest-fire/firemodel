/**
 * A mocking error originated within FireModel
 */
export declare class MockError extends Error {
    firemodel: boolean;
    code: string;
    constructor(message: string, classification?: string);
}

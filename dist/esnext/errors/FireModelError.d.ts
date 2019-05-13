export declare class FireModelError extends Error {
    code: string;
    firemodel: boolean;
    constructor(message: string, code?: string);
}

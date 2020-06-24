/**
 * Base **Error** for **FireModel**. Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
export declare class FireModelError extends Error {
    firemodel: boolean;
    code: string;
    constructor(message: string, classification?: string);
}

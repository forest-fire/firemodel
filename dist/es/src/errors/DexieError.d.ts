/**
 * An error deriving from the **Dexie** integration with **Firemodel**.
 * Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
export declare class DexieError extends Error {
    firemodel: boolean;
    code: string;
    constructor(message: string, classification?: string);
}

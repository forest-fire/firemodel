import { FireModelError } from "../private";
export declare class FireModelProxyError extends FireModelError {
    firemodel: boolean;
    code: string;
    originalError: Error | FireModelError;
    constructor(e: Error | FireModelError, context?: string, name?: string);
}

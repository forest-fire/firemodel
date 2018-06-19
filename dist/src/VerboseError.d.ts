export declare type LazyString = () => string;
export interface IStackFrame {
    getTypeName: LazyString;
    getFunctionName: LazyString;
    getMethodName: LazyString;
    getFileName: LazyString;
    getLineNumber: LazyString;
    getColumnNumber: LazyString;
    isNative: LazyString | string;
}
export interface IVerboseError {
    /** A short and unique identifier for the error; typically would not have any spaces in it */
    code: string;
    /** A user-friendly description of the error message */
    message: string;
    module?: string;
    function?: string;
    fileName?: string;
    stackFrames?: any[];
}
export declare class VerboseError extends Error implements IVerboseError {
    static useColor: false;
    static filePathDepth: 3;
    /**
     * If you want to use a library like stack-trace(node) or stacktrace-js(client) add in the "get"
     * function that they provide
     */
    static setStackParser(fn: (err: IVerboseError) => any): void;
    private static stackParser;
    code: string;
    message: string;
    module?: string;
    function?: string;
    stackFrames?: IStackFrame[];
    constructor(err: IVerboseError, ...args: any[]);
    toString(): string;
    toJSON(): string;
    toObject(): {
        code: string;
        message: string;
        module: string;
    };
}

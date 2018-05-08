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
    code: string;
    message: string;
    module?: string;
    function?: string;
    fileName?: string;
    stackFrames?: any[];
}
export declare class VerboseError extends Error implements IVerboseError {
    static useColor: false;
    static filePathDepth: 3;
    static setStackParser(fn: (err: IVerboseError) => any): void;
    private static stackParser(err);
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

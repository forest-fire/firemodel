export declare function normalized(...args: string[]): string[];
export declare function slashNotation(...args: string[]): string;
export declare function dotNotation(...args: string[]): string;
export interface IExtendedError extends Error {
    underlying: any;
    code: string;
    details: any[];
}

import { Model, Record, IFmPathValuePair } from "..";
export declare function extractFksFromPaths<T extends Model>(rec: Record<T>, prop: keyof T, paths: IFmPathValuePair[]): string[];

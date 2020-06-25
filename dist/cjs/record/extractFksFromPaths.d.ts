import { IFmPathValuePair, Model, Record } from "../private";
export declare function extractFksFromPaths<T extends Model>(rec: Record<T>, prop: keyof T & string, paths: IFmPathValuePair[]): string[];

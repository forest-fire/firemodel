import { Model, Record } from "../private";
import { IFmPathValuePair } from "../@types/index";
export declare function extractFksFromPaths<T extends Model>(rec: Record<T>, prop: keyof T & string, paths: IFmPathValuePair[]): string[];

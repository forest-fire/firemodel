import { IFmPathValuePair } from "../../types";
import { IModel } from "../../types";
import { Record } from "..";
export declare function extractFksFromPaths<T extends IModel>(rec: Record<T>, prop: keyof T & string, paths: IFmPathValuePair[]): string[];

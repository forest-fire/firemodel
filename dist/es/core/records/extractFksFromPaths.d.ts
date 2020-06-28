import { IFmPathValuePair } from "../../@types/index";
import { IModel } from "../../@types/index";
import { Record } from "..";
export declare function extractFksFromPaths<T extends IModel>(rec: Record<T>, prop: keyof T & string, paths: IFmPathValuePair[]): string[];

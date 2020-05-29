import { IFmModelPropertyMeta, Model } from "../private";
import { IAbstractedDatabase } from "universal-fire";
import { MockHelper } from "firemock";
export declare function mockValue<T extends Model>(db: IAbstractedDatabase, propMeta: IFmModelPropertyMeta<T>, mockHelper: MockHelper, ...rest: any[]): any;

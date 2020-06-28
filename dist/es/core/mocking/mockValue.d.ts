import { IFmModelPropertyMeta, IModel } from "../../types";
import { IAbstractedDatabase } from "universal-fire";
import { MockHelper } from "firemock";
export declare function mockValue<T extends IModel>(db: IAbstractedDatabase, propMeta: IFmModelPropertyMeta<T>, mockHelper: MockHelper, ...rest: any[]): any;

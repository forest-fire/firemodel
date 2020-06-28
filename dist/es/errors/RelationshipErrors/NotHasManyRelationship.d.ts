import { IModel, IRecord } from "../../@types/index";
import { FireModelError } from "..";
export declare class NotHasManyRelationship<T extends IModel> extends FireModelError {
    constructor(rec: IRecord<T>, property: string, method: string);
}

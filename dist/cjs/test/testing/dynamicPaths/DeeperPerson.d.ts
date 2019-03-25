import { Model } from "../../../src";
export interface IDeepName {
    first: string;
    middle?: string;
    last: string;
}
export declare class DeeperPerson extends Model {
    name: IDeepName;
    age: number;
    group: string;
    subGroup: string;
    phoneNumber: string;
}

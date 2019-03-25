import { Model } from "../../../src";
export interface IDeepName {
    first: string;
    middle?: string;
    last: string;
}
export declare class MockedPerson extends Model {
    name: IDeepName;
    age: number;
    phoneNumber: string;
    group: string;
    subGroup: string;
}

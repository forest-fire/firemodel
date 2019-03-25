import { Model, fks, fk } from "../../../src";
export interface IDeepName {
    first: string;
    middle?: string;
    last: string;
}
export default class DeepPerson extends Model {
    name: IDeepName;
    age: number;
    nickname?: string;
    group: string;
    photo?: string;
    phoneNumber: string;
    school?: fk;
    home?: fk;
    employer?: fk;
    hobbies?: fks;
    cars?: fks;
    parents?: fks;
    children?: fks;
    attributes?: fks;
}

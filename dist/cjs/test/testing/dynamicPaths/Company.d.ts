import { Model, fks } from "../../../src";
export default class Company extends Model {
    name: string;
    state: string;
    group: string;
    employees: fks;
}

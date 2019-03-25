import { Model, fks } from "../../../src";
export default class School extends Model {
    name: string;
    state: string;
    group: string;
    students: fks;
}

import { Model, fks } from "../../../src";
export default class Hobby extends Model {
    name: string;
    practitioners: fks;
}

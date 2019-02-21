import { IDictionary } from "common-types";
export declare type IIdWithDynamicPrefix = IDictionary<number | string> & {
    id: string;
};

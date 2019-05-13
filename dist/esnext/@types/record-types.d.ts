import { IDictionary, fk, pk, epoch } from "common-types";
export declare type IIdWithDynamicPrefix = IDictionary<number | string> & {
    id: string;
};
export declare type ICompositeKey = IDictionary<string | number> & {
    id: string;
};
export declare type IFkReference = fk | ICompositeKey;
export declare type IPrimaryKey = pk | ICompositeKey;
export interface IFmBuildRelationshipOptions {
    /**
     * optionally send in a epoch timestamp; alternative it will be created
     * automatically. The ability to send a value allows for hasMany operations which
     * are more than a single PK:FK grouped as a transaction
     */
    now?: epoch;
    /**
     * the "other value" pairing for a _hasMany_ relationship; defaults to `true`
     */
    altHasManyValue?: true | any;
    /**
     * By default it is assumed the action for paths is to build relationships but
     * if the operation is asking for the removal of relationships this should be
     * set to "remove"
     */
    operation?: "remove" | "add";
}

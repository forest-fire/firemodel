import "reflect-metadata";
export declare function hasMany(modelConstructor: new () => any): (modelKlass: import("../Model").Model, key: string) => void;
export declare function ownedBy(modelConstructor: new () => any): (modelKlass: import("../Model").Model, key: string) => void;
export declare function inverse(inverseProperty: string): (modelKlass: import("../Model").Model, key: string) => void;

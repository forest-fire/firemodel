import "reflect-metadata";
export declare function hasMany(modelConstructor: new () => any): PropertyDecorator;
export declare function ownedBy(modelConstructor: new () => any): PropertyDecorator;
export declare function inverse(inverseProperty: string): (target: import("../../../../../../../Users/ken/mine/forest-fire/firemodel/src/Model").Model, key: string) => void;

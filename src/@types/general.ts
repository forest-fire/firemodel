import { Model } from "../Model";

export type FmModelConstructor<X extends Model> = new () => X;

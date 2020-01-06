import "reflect-metadata";
import { IFmModelMeta } from "./types";
import { Model } from "../Model";
import { FmModelConstructor } from "../@types/general";
export declare function model(options?: Partial<IFmModelMeta>): <T extends Model>(target: FmModelConstructor<T>) => FmModelConstructor<T>;

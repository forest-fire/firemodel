import "reflect-metadata";
import { FmModelConstructor, Model, IFmModelMeta } from "@/private";
export declare function model(options?: Partial<IFmModelMeta>): <T extends Model>(target: FmModelConstructor<T>) => FmModelConstructor<T>;

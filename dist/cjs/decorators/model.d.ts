import "reflect-metadata";
import { FmModelConstructor, IFmModelMeta, Model } from "../private";
export declare function model(options?: Partial<IFmModelMeta>): <T extends Model>(target: FmModelConstructor<T>) => FmModelConstructor<T>;

import "reflect-metadata";
import { FmModelConstructor, IFmModelMeta, IModel } from "../@types/index";
export declare function model(options?: Partial<IFmModelMeta>): <T extends IModel>(target: FmModelConstructor<T>) => FmModelConstructor<T>;

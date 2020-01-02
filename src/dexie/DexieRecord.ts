/**
 * Provides a simple API to do CRUD operations
 * on Dexie/IndexDB which resembles the Firemodel
 * API.
 */
export class DexieRecord {
  static async get(model: IModelConstructor, id: IPrimaryKey) {
    //
  }
  
  static async add<T>(model: IModelConstructor<T>, id: IPrimaryKey, updateHash: Partial<T>) {
    //
  }

  static async update<T>(model: IModelConstructor<T>, id: IPrimaryKey, updateHash: Partial<T>) {
    //
  }

  static async remove<T>(model: IModelConstructor<T>, id: IPrimaryKey) {
    //
  }


}
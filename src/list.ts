import { BaseSchema } from './base-schema';

export class List<T extends BaseSchema> {

  constructor(public data?: T[]) {}

  public get length() {
    return this.data.length;
  }
}

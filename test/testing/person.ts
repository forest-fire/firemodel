import {
  Model,
  BaseSchema,
  property,
  constrainedProperty,
  constrain,
  desc,
  min,
  max,
  length,
  schema
} from '../../src/index';

@schema({ dbOffset: 'authenticated' })
export class Person extends BaseSchema {
  @property @length(20) public name: string;
  @property public age?: number;
}

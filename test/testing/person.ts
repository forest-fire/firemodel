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
  schema,
  fk,
  ownedBy,
  hasMany,
  inverse
} from '../../src/index';
import { Company } from './company';

@schema({ dbOffset: 'authenticated' })
export class Person extends BaseSchema {
  @property @length(20) public name: string;
  @property public age?: number;

  @ownedBy(Person) @inverse('children') public motherId?: fk;
  @ownedBy(Person) @inverse('children') public fatherId?: fk;
  @hasMany(Person) public children?: fk[];

  @ownedBy(Company) public employerId?: fk;
}

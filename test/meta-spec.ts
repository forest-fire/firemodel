import { Model, BaseSchema, property, constrainedProperty, constrain, desc, min, max, length, schema } from '../src/index';
import DB from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;
import 'reflect-metadata';
/* tslint:disable:max-classes-per-file */

export type Callback = (m: string) => boolean;

class SubKlass extends BaseSchema {
  @property public sub: string = 'subklass';
}

class ContainedKlass {
  public c1: number = 1;
  public c2: number = 1;
  public c3: number = 1;
}

/** a schema class */
@schema({ dbOffset: 'authenticated', storeOffset: 'foobar' })
class Klass extends SubKlass {
  @desc('who doesn\'t love a foobar?')
  @property @length(15) public foobar: string;
  @property public foo: string;
  @desc('the bar is a numeric property that holds no real meaning')
  @property @constrain('min', 2) public bar: number = 8;
  @constrainedProperty({ min: 1, max: 20 }) public bar2: number = 12;
  @property @min(5) @max(10) public bar3: number;
  @property public cb: Callback;
  @property public baz: ContainedKlass;
}

describe('schema() decorator: ', () => {
  it('can read meta properties set in decorator', () => {
    const myclass: any = new Klass();
    expect(myclass.META.dbOffset).to.equal('authenticated');
    expect(myclass.META.storeOffset).to.equal('foobar');
  });

  it('setting meta throws error', () => {
    const myclass: any = new Klass();
    try {
      myclass.META = { foo: 'bar' };
      expect(false, 'setting meta property is not allowed!');
    } catch(e) {
      expect(e.message).to.equal('The meta property can only be set with the @schema decorator!');
    }
  });
});

describe('property decorator: ', () =>  {

  it('can discover type for properties on class', () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata('foo', myclass).type).to.equal('String');
    expect(Reflect.getMetadata('bar', myclass).type).to.equal('Number');
    expect(Reflect.getMetadata('bar2', myclass).type).to.equal('Number');
    expect(Reflect.getMetadata('sub', myclass).type).to.equal('String');
    expect(Reflect.getMetadata('id', myclass).type).to.equal('String');
  });

  it('constraint() decorator-factory adds constrain metadata', () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata('bar', myclass).min).to.equal(2);
  });

  it('constrainedProperty() decorator-factory allows adding multiple contraints', () => {
    const myclass = new Klass();
    expect(Reflect.getMetadata('foobar', myclass).length).to.equal(15);
    expect(Reflect.getMetadata('foobar', myclass).desc).to.equal('who doesn\'t love a foobar?');
    expect(Reflect.getMetadata('bar3', myclass).min).to.equal(5);
    expect(Reflect.getMetadata('bar3', myclass).max).to.equal(10);

  });

  it('min(), max(), length(), and desc() decorator-factories work', () => {
    const myclass = new Klass();

  });

  it('all base meta keys are represented', () => {
    const myclass = new Klass();
    const keys: string[] = Reflect.getMetadataKeys(myclass);
    expect(keys).to.include.members(['id', 'lastUpdated', 'createdAt']);
  });
});

// describe('Relationship Metadata/Reflection: ', () =>  {
//   it('relationships ')
// }

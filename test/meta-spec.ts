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
} from '../src/index';
import DB from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
import { Klass, ContainedKlass, SubKlass } from './testing/klass';
const expect = chai.expect;
import 'reflect-metadata';

describe('schema() decorator: ', () => {
  it('can read Schema meta properties', () => {
    const myclass: any = new Klass();
    expect(myclass.META.dbOffset).to.equal('authenticated');
    expect(myclass.META.localOffset).to.equal('foobar');
  });

  it('can read Property meta properties off of META.property', () => {
    const myclass = new Klass();
    expect(myclass.META.property('foo').type).to.equal('String');
    expect(myclass.META.property('bar').type).to.equal('Number');
    expect(myclass.META.property('bar3').max).to.equal(10);
  });

  it('setting meta throws error', () => {
    const myclass: any = new Klass();
    try {
      myclass.META = { foo: 'bar' };
      expect(false, 'setting meta property is not allowed!');
    } catch (e) {
      expect(e.message).to.equal(
        'The meta property can only be set with the @schema decorator!'
      );
    }
  });
});

describe('property decorator: ', () => {
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
    expect(Reflect.getMetadata('foobar', myclass).desc).to.equal(
      "who doesn't love a foobar?"
    );
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

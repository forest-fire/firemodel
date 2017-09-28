import { Model, BaseSchema } from '../src/index';
import DB from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;
import 'reflect-metadata';
import { Klass, ContainedKlass, SubKlass } from './testing/klass';
import { Person } from './testing/person';

describe('Model', () => {
  it('can act as a factory for schema', () => {
    const db = new DB({ mocking: true });
    const k = new Model<Klass>(Klass, db);
    expect(k).to.be.an('object');
    expect(k.newRecord().data).to.be.instanceOf(BaseSchema);
    expect(k.newRecord().data).to.be.instanceOf(Klass);
  });

  it('newRecord() returns empty record, with schema META set', () => {
    const db = new DB({ mocking: true });
    const k = new Model<Klass>(Klass, db);
    expect(k.newRecord().data.id).to.equal(undefined);
    expect(k.newRecord().data.foo).to.equal(undefined);
    expect(k.newRecord().data.META.dbOffset).to.equal('authenticated');
  });

  it('newRecord(obj) returns Record with data loaded', () => {
    const db = new DB({ mocking: true });
    const k = new Model<Klass>(Klass, db);
    const data = { foo: 'test', bar: 12 };
    expect(k.newRecord(data).data.id).to.equal(undefined);
    expect(k.newRecord(data).data.foo).to.equal('test');
  });

  it('newRecord() ... "existsOnDB" is set to false', () => {
    const db = new DB({ mocking: true });
    const k = new Model<Klass>(Klass, db);
    const data = { foo: 'test', bar: 12 };
    const r1 = k.newRecord();
    const r2 = k.newRecord(data);
    expect(r1.existsOnDB).to.equal(false);
    expect(r2.existsOnDB).to.equal(false);
    ;
  });

  it('getRecord() retrieves a record from the DB', async () => {
    const db = new DB({ mocking: true });
    const PersonModel = new Model<Person>(Person, db);
    await db.set<Person>('/authenticated/1234', {
      name: 'Billy Bob',
      age: 45
    });
    const billy = await PersonModel.getRecord('1234');
    expect(billy.existsOnDB).to.equal(true);
  })

});

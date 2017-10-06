import { Model, BaseSchema, Record, List, IAuditRecord, FirebaseCrudOperations } from '../src/index';
import DB from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;
import 'reflect-metadata';
import { Klass, ContainedKlass, SubKlass } from './testing/klass';
import { Person } from './testing/person';
import { Company } from './testing/company';
import { VerboseError } from 'common-types';
import { get as getStackFrame, parse as stackParse } from 'stack-trace';

VerboseError.setStackParser((context: VerboseError) => stackParse(context));

describe('Model > find API: ', () => {
  let db: DB;
  beforeEach(() => {
    db = new DB({ mocking: true });
  });

  it('Model.findAll() with default equality operator works', async () => {
    db.mock.addSchema('person', (h) => () => ({
      name: h.faker.name.firstName(),
      age: h.faker.random.number({ min: 1, max: 99 })
    })).pathPrefix('authenticated');
    db.mock.queueSchema<Person>('person', 25, { age: 10 });
    db.mock.queueSchema<Person>('person', 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll('age', 70);
    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(25);
  });

  it('Model.findAll() works with overriden equality operator', async () => {
    db.mock.addSchema('person', (h) => () => ({
      name: h.faker.name.firstName(),
      age: h.faker.random.number({ min: 1, max: 99 })
    })).pathPrefix('authenticated');
    db.mock.queueSchema<Person>('person', 25, { age: 10 });
    db.mock.queueSchema<Person>('person', 25, { age: 60 });
    db.mock.queueSchema<Person>('person', 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll('age', ['=', 60]);
    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(25);
  });

  it('Model.findAll() works with overriden greater-than operator', async () => {
    db.mock.addSchema('person', (h) => () => ({
      name: h.faker.name.firstName(),
      age: h.faker.random.number({ min: 1, max: 99 })
    })).pathPrefix('authenticated');
    db.mock.queueSchema<Person>('person', 25, { age: 10 });
    db.mock.queueSchema<Person>('person', 25, { age: 60 });
    db.mock.queueSchema<Person>('person', 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll('age', ['>=', 60]);
    const allPeople = await PersonModel.getAll();

    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(50);
  });
  it('Model.findAll() with overriden less-than operator works', async () => {
    db.mock.addSchema('person', (h) => () => ({
      name: h.faker.name.firstName(),
      age: h.faker.random.number({ min: 1, max: 99 })
    })).pathPrefix('authenticated');
    db.mock.queueSchema<Person>('person', 25, { age: 10 });
    db.mock.queueSchema<Person>('person', 25, { age: 60 });
    db.mock.queueSchema<Person>('person', 25, { age: 70 });
    db.mock.generate();
    const PersonModel = new Model<Person>(Person, db);
    const olderPeople = await PersonModel.findAll('age', ['<=', 20]);
    expect(olderPeople).is.an.instanceOf(List);
    expect(olderPeople.length).to.equal(25);
  });

});

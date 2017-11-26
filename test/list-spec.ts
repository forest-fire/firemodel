import { Model, BaseSchema, Record, List } from '../src/index';
import DB from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;
import 'reflect-metadata';
import { Person } from './testing/person';

describe('List class: ', () => {
  it('can instantiate from model', () => {
    const db = new DB({ mocking: true });
    const PersonModel = new Model<Person>(Person, db);
    const list = new List<Person>(Person, 'people', db);
    expect(list).to.be.instanceof(List);
    expect(list.length).to.equal(0);
    expect(list.modelName).to.equal('person');
    expect(list.pluralName).to.equal('people');
    expect(list.dbPath).to.equal(`${list.meta.dbOffset}/people`);
  });

});

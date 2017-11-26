import { Model, BaseSchema, Record } from '../src/index';
import DB from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as chai from 'chai';
const expect = chai.expect;

const personMock: SchemaCallback<Person> = h => () => ({
  name: h.faker.name.firstName(),
  age: h.faker.random.number({ min: 1, max: 100 })
});

export class Person extends BaseSchema {
  public static create(db: DB) {
    const m = new Model<Person>(Person, db);
    m.mockGenerator = personMock;
    return m;
  }
  public name: string;
  public age: number;
}

describe('Create a Model: ', () => {
  it('can instantiate a Model', () => {
    const db = new DB({ mocking: true });
    const person = new Model<Person>(Person, db);
    expect(person).to.be.an('object');
    expect(person).to.be.an.instanceOf(Model);
    expect(person.modelName).to.equal('person');
    expect(person.newRecord()).to.be.an.instanceOf(Record);
    expect(person.newRecord().data).to.be.an.instanceOf(Person);
  });

  it('Schema\'s create() method instantiates', () => {
    const db = new DB({ mocking: true });
    const person = Person.create(db);
    person.pluralName = 'foobar';
    expect(person).to.be.an('object');
    expect(person).to.be.an.instanceOf(Model);
    expect(person.modelName).to.equal('person');
    expect(person.newRecord().data).to.be.an.instanceOf(Person);
  });

  it('singular and plural names are right', () => {
    const db = new DB({ mocking: true });
    const person = new Model<Person>(Person, db);
    expect(person.modelName).to.equal('person');
    expect(person.pluralName).to.equal('people');
  });

  it('can override plural name by setting pluralName', () => {
    const db = new DB({ mocking: true });
    const person = new Model<Person>(Person, db);
    person.pluralName = 'foobar';
    expect(person.modelName).to.equal('person');
    expect(person.pluralName).to.equal('foobar');
  });

});

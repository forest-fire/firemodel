import { Model, BaseSchema } from '../src/index';
import DB from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as chai from 'chai';
import * as helpers from './testing/helpers';
const expect = chai.expect;

const personMock: SchemaCallback<Person> = (h) => () => ({
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

describe('Mocking:', () => {

  it.skip('Setting a mockGenerator overrides default', async () => {
    const db: DB = new DB({ mocking: true });
    const person = Person.create(db);
    person.generate(10);
    const people = await db.getList<Person>('/people');
    expect(people).lengthOf(10);
    expect(people[0]).to.have.property('id');
    expect(people[0]).to.have.property('name');
    expect(people[0]).to.have.property('age');
    expect(people[0]).to.have.property('createdAt');
    expect(people[0]).to.have.property('lastUpdated');
    expect(people[0].age).to.be.a('number');
    expect(people[0].createdAt).to.be.a('string');
  });

  it.skip('Bespoke mockGenerator can be generated');
  it.skip('Default mockGenerator can get schema properties');
  it.skip('Default mockGenerator can generate reasonable mock data');

});

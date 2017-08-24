import Model from '../src/model';
import Mock from 'firemock';
import * as chai from "chai";
const expect = chai.expect;

export interface IPerson {
  name: string;
  age: number;
}

class Person extends Model {

}

describe("thingy", () => {
  it.skip("should do something", () => {
    expect(true).to.not.equal(undefined);
  });
});

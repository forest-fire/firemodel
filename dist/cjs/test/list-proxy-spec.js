// // tslint:disable:no-implicit-dependencies
// import * as chai from "chai";
// // import { CreateListProxy } from "../src/CreateListProxy";
// // import { ArrayOfRecords } from "../src/ArrayOfRecords";
// import { Person } from "./testing/person";
// import { DB } from "abstracted-admin";
// // import { ListProxy } from "../src/ListProxy";
// const expect = chai.expect;
// const people: () => Person[] = () => [
//   {
//     id: "1234",
//     name: "Fred",
//     age: 23
//   },
//   {
//     id: "4567",
//     name: "Carol",
//     age: 32
//   }
// ];
// describe("List Proxy →", () => {
//   it("Passing in a Model opens up meta info and still treated as an Array", async () => {
//     const proxy = ListProxy.create(Person, people());
//     expect(Array.isArray(proxy)).to.equal(true);
//     expect(proxy.length).to.equal(2);
//     expect(proxy.modelName).to.equal("person");
//     expect(proxy.relationships.map(i => i.property)).to.includes("father");
//     expect(proxy.relationships.length).to.equal(4);
//     expect(proxy.property("age").type).to.equal("Number");
//   });
//   it.skip("map() works on ListProxy", async () => {
//     const peeps = ListProxy.create(Person, people());
//     // const ages = peeps.map<number>(i => i.age);
//     // expect(Array.isArray(ages));
//   });
//   it.skip("filter() works on ListProxy", () => {
//     const peeps = ListProxy.create(Person, people());
//     const less = peeps.filter(i => i.id === "1234");
//     expect(less.length).to.equal(1);
//   });
//   it.skip("Pushing a new element is sent to the database as new record", async () => {
//     const db = new DB({ mocking: true });
//     await db.waitForConnection();
//     db.mock.updateDB({
//       authenticated: { people }
//     });
//     const toStart = await db.getList("/authenticated/people");
//     expect(toStart).to.have.lengthOf(2);
//     const peeps = ListProxy.create(Person, people());
//     peeps.push({
//       id: "8888",
//       name: "Glentilda",
//       age: 99
//     });
//     expect(peeps.length).to.equal(3);
//   });
// });
//# sourceMappingURL=list-proxy-spec.js.map
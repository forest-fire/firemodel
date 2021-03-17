import { IAbstractedDatabase, IRealTimeAdmin, RealTimeAdmin } from "universal-fire";
import { Car } from "./testing/Car";
import { FireModel, List, Mock } from "@/core/index";

describe("List Options: ", () => {
  let db: IAbstractedDatabase;
  beforeEach(async () => {
    db = await RealTimeAdmin.connect({ mocking: true });
    await Mock(Car, db).generate(12, { model: "Mustang" });
    await Mock(Car, db).generate(12, { model: "Camaro" });
    FireModel.defaultDb = db;
  });

  it("Using the 'limit' option the results are reduced accordingly", async () => {
    const all = await List.all(Car);
    const allLimited = await List.all(Car, { limitToFirst: 10 });
    const where = await List.where(Car, "model", "Mustang");
    const whereLimited = await List.where(Car, "model", "Mustang", {
      limitToFirst: 10,
    });
    const since = await List.since(Car, new Date("1970-01-01").getTime());
    const sinceLimited = await List.since(
      Car,
      new Date("1970-01-01").getTime(),
      { limitToFirst: 10 }
    );
  });
});

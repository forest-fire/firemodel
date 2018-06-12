import { Record } from "./Record";
import { ArrayOfRecords } from "./ArrayOfRecords";

function setHandler(target: any, prop: PropertyKey, value: any, receiver: any) {
  console.log("SET");

  return false;
}

const handler = <T>() => ({
  construct(target: ArrayOfRecords<T>, ...args: any[]) {
    const originalArray: ArrayOfRecords<T> = args.unshift() as any;
    const index = {};
    const newArray = new ArrayOfRecords<T>(...originalArray);
    return new Proxy(newArray, {
      get(t: any, name: string) {
        if (name === "push") {
          return (item: any) => {
            console.log("pushed");
            return t[name].call(t, item);
          };
        }
      },
      set: setHandler
    });
  }
});

export const ListProxy = <T = any>(modelContructor: new () => T) => {
  const record = Record.create(modelContructor);
  return (list: T[]): ArrayOfRecords<T> => {
    const listOfRecords = new ArrayOfRecords<T>(...list);
    listOfRecords.__record__ = record;
    return new Proxy<ArrayOfRecords<T>>(listOfRecords, handler<T>());
  };
};

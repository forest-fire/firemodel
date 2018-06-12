import { Record } from "./Record";
import { ArrayOfRecords } from "./ArrayOfRecords";
import { ListProxy } from "./ListProxy";

function setHandler(target: any, prop: PropertyKey, value: any, receiver: any) {
  console.log("SET");

  return false;
}

const handler = <T>() => ({
  construct(target: ListProxy<T>, ...args: any[]) {
    const originalArray: ListProxy<T> = args.unshift() as any;
    const index = {};
    const newArray = ListProxy.create<T>(originalArray, originalArray.__record__);
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

export const CreateListProxy = <T = any>(modelContructor: new () => T) => {
  const record = Record.create(modelContructor);
  return (list: T[]): ListProxy<T> => {
    const listOfRecords = ListProxy.create<T>(list, record);
    listOfRecords.__record__ = record;
    return new Proxy<ListProxy<T>>(listOfRecords, handler<T>());
  };
};

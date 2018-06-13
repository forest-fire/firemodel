import { Record } from "../Record";
import { ListProxy } from "../ListProxy";
function setHandler(target, prop, value, receiver) {
    console.log("SET");
    return false;
}
const handler = () => ({
    construct(target, ...args) {
        const originalArray = args.unshift();
        const index = {};
        const newArray = ListProxy.create(originalArray, originalArray.__record__);
        return new Proxy(newArray, {
            get(t, name) {
                if (name === "push") {
                    return (item) => {
                        console.log("pushed");
                        return t[name].call(t, item);
                    };
                }
            },
            set: setHandler
        });
    }
});
export const CreateListProxy = (modelContructor) => {
    const record = Record.create(modelContructor);
    return (list) => {
        const listOfRecords = ListProxy.create(list, record);
        listOfRecords.__record__ = record;
        return new Proxy(listOfRecords, handler());
    };
};
//# sourceMappingURL=CreateListProxy.js.map
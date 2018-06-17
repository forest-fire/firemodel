import { IDictionary } from "common-types";

export type IVuexDispatch = (type: string, payload: IDictionary) => void;
export type IReduxDispatch = (payload: IDictionary) => void;
export interface IReduxAction extends IDictionary {
  type: string;
}

export const VeuxWrapper = (vuexDispatch: IVuexDispatch) => (
  reduxAction: IReduxAction
) => {
  const type = reduxAction.type;
  delete reduxAction.type;
  vuexDispatch(type, reduxAction);
};

import { LaAtom } from "@app/shared";

export class PluginData extends LaAtom {
    sourceGuid: string;
    timeStamp: string;
    name:string;
    type:string;
    active:string;
    description:string;
    extra:string;

    constructor(properties?: any) {
      super(properties);
    }

    toString() {
      return JSON.stringify(this,undefined,3)
    }
  }

import { Tools } from '@app/shared';
import { LaAtom } from '../shared/la-atom';

export const TOPIC_AdvancedQuery = 'AdvancedQuery';

export class LaQuery extends LaAtom {
  includeall: string;
  includeany: string;
  exactphrase: string;
  excludeany: string;
  classFilter: string[];
  tagsFilter: string[];

  constructor(properties?: any) {
    super(properties);
  }

  isEmpty(){
    return Tools.isEmpty(this.simplify());
  }

  simplify(){
    const display = {};
    Object.keys(this).forEach(key => {
      if ( !Tools.isEmpty(this[key]) ) {
        display[key] = this[key]
      }
    });
    return display;
  }
}

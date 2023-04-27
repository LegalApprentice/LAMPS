import { LaAtom } from '../shared/la-atom';
import { LaSentence } from '.';
import { environment } from '@environments/environment';

export class LaStats extends LaAtom {

  // public isType(name:string): boolean {
  //   return Tools.matches(`LaStats`,name);
  // }
  // get myType(): string {
  //   return `LaStats`;
  // }

  name = '';
  label = '';
  filter = '';
  perserveOrder= false
  members: Array<LaSentence> = new Array<LaSentence>();

  constructor(properties?: any) {
    super(properties);
    this.override(properties)

    const filter = 'Sentence';
    let label = this.name.replace(filter, '');
    label = label == '' ? filter : label;

    if ( label === filter) {
      label = 'Other';
    }
    this.label = label;
  }

  getMembers(): Array<LaSentence> {
    return this.members;
  }

  addMember(obj: LaSentence) {
    this.members.push(obj);
  }

  total() {
    return this.members.length;
  }

  sortMembers() {
    if ( !this.perserveOrder) {
      this.members = this.members.sort((a, b) => b.compareProbability(a));
    }
    return this
  }


  isMarkerVisible() {
    return this.total() > 0 || environment.isLegalMarker
  }

  markerToolTip() {
    return this.markerLabel()
  }

  markerLabel() {
    return `${this.label} (${this.total()})`;
  }
}

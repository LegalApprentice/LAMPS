import { LaAtom } from '../shared/la-atom';

export class LaAttributionRelation extends LaAtom {
  type: string;
  cue: string;
  subject: string;
  object: string;
  polarity: string; // positive, undecided, negative


  constructor(properties?: any) {
    super(properties);
  }

  private isStringEmpty(item) {
    return item == null || item === '';
  }

  get polarityValue() {
    return this.polarity || 'undecided';
  }
  set polarityValue(value) {
    this.polarity = value;
  }

  get polarityColor() {
    const result = this.polarityValue;
    if ( result === 'positive') {
      return `rgba(0,204,0,0.3)`;
    } else if ( result === 'negative') {
      return `rgba(255,0,0,0.3)`;
    }
    return 'white';
  }



  clear() {
    this.cue = '';
    this.subject = '';
    this.object = '';
  }

  setTypeFromSentence(type: string) {
    this.type = type.replace('Sentence', '');
  }

  isSaveWorthy() {
    return !this.isEmpty();
  }

  isDeletable() {
    return this.isEmpty();
  }

  isEmpty() {
    return (
      this.isStringEmpty(this.cue) &&
      this.isStringEmpty(this.subject) &&
      this.isStringEmpty(this.object)
    );
  }

  isMissingData() {
    return (
      this.isStringEmpty(this.cue) ||
      this.isStringEmpty(this.subject) ||
      this.isStringEmpty(this.object)
    );
  }
}

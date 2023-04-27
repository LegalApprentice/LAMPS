import { Tools } from '@app/shared';
import { LaAtom } from '../shared/la-atom';
import { LaSentence } from './la-sentence';

export class LaDecisionNode extends LaAtom {
  label: string;
  ruleID: string;
  operation: string;
  polarity: string; // positive, undecided, negative, neutral
  stipulation: any;
  calculateSentencePolarity: (idList:Array<String>) => string;

  parent: LaDecisionNode;
  subNodes: Array<LaDecisionNode>;

  private sentenceLinks: Array<String>;

  constructor(properties?: any) {
    super(properties);

    if ( this.ruleID && this.ruleID.indexOf('|') > 0) {
      this.ruleID = this.ruleID.replace('|','_')
    }
  }

  sentTag(): string {
    return `D:${this.ruleID}`;
  }

  hasChildren() {
    if (this.subNodes == null) { return false; }
    if (this.subNodes.length == 0) { return false; }
    return true;
  }

  hasOneChild() {
    if (this.subNodes == null) { return undefined; }
    if (this.subNodes.length == 1) { return this.subNodes[0]; }
    return undefined;
  }

  childCount() {
    if (this.subNodes == null) { return 0; }
    return this.subNodes.length;
  }

  // maybe a dictionary based on operator will be faster
  childANDs() {
    if (this.subNodes == null) { return []; }
    return this.subNodes.filter(item => item.operation != 'OR' && item.operation != 'REBUT');
  }

  childORs() {
    if (this.subNodes == null) { return []; }
    return this.subNodes.filter(item => item.operation == 'OR');
  }

  childREBUTs() {
    if (this.subNodes == null) { return []; }
    return this.subNodes.filter(item => item.operation == 'REBUT');
  }

  addChild(node: LaDecisionNode) {
    if (this.subNodes == null) {
      this.subNodes = new Array<LaDecisionNode>();
    }
    node.parent = this;
    this.subNodes.push(node);
    return this;
  }

  setStipulation(value) {
    this.stipulation = value;
  }

  stipulationClass() {
    if (this.stipulation == true) {
      return 'positive';
    }
    if (this.stipulation == false) {
      return 'negative';
    }
    return this.stipulation;
  }

  // maybe refactor into switch or case
  inversePolarityValue(value) {
    if (value === 'positive') {
      return 'negative';
    }
    if (value === 'negative') {
      return 'positive';
    }
    return value;
  }

  // is should be based on child values
  computeNodePolarity() {
    if (this.stipulation !== undefined) {
      return this.stipulationClass();
    }

    if ( this.calculateSentencePolarity && this.sentenceLinks?.length > 0) {
      const fromFinding = this.calculateSentencePolarity(this.sentenceLinks);
      return fromFinding;
    }

    let result = this.polarityValue;
    if (!this.hasChildren()) {
      return result;
    }

    const child = this.hasOneChild();
    if (child) {
      result = child.computeNodePolarity();
      if (child.operation == 'REBUT') {
        return this.inversePolarityValue(result);
      }
      return result;
    }
    // now do the ands and ors
    const count = this.childCount();
    const theORS = this.childORs();

    // everything is a OR return the first true
    if (count == theORS.length) {

    }

    return result;
  }

  get polarityValue() {
    return this.polarity || 'undecided';
  }

  get polarityColor() {
    const result = this.computeNodePolarity();
    if ( Tools.matches(result,'positive')) {
      return `rgba(0,255,0,0.7)`;
    } else if ( Tools.matches(result,'negative')) {
      return `rgba(255,0,0,0.7)`;
    } else if ( Tools.matches(result,'neutral')) {
      return 'white'
    } else if ( Tools.matches(result,'undecided')) {
      return 'black'
    }
    return `blue`;
  }

  set polarityValue(value) {
    this.polarity = value;
  }

  get myCount() {
    return this.subNodes && this.subNodes.length;
  }

  get parentCount() {
    return this.parent.myCount;
  }

  get memberId() {
    let id = 0;
    if (this.parent && this.parent.subNodes) {
      id = this.parent.subNodes.indexOf(this) + 1;
    }
    return id;
  }

  get memberLabel() {
    if (this.parent == undefined) {
      return '';
    }

    if (this.operation == undefined) {
      return '';
    }

    const pos = this.memberId;
    const count = this.parentCount;
    const op = this.operation || '';
    return `${op} [${pos} of ${count}]`;
  }

  hasSentence(sentence: LaSentence): boolean {
    return this.hasSentenceID(sentence.sentID);
  }

  hasSentenceID(key: string): boolean {
    if (this.sentenceLinks) {
      const index = this.sentenceLinks.indexOf(key);
      return index >= 0;
    }
    return false;
  }

  getSentenceKeys(): Array<String> {
    if (!this.sentenceLinks) {
      return new Array<String>();
    }
    return this.sentenceLinks;
  }

  addSentence(sentence: LaSentence): LaDecisionNode {
    return this.addSentenceID(sentence.sentID);
  }

  addSentenceID(key: string): LaDecisionNode {
    if (!this.sentenceLinks) {
      this.sentenceLinks = new Array<String>();
    }

    const index = this.sentenceLinks.indexOf(key);
    if (index === -1) {
      this.sentenceLinks.push(key);
    }
    return this;
  }

  removeSentence(sentence: LaSentence): LaDecisionNode {
    return this.removeSentenceID(sentence.sentID);
  }

  removeSentenceID(key: string): LaDecisionNode {
    if (this.sentenceLinks) {
      const index = this.sentenceLinks.indexOf(key);
      if (index > -1) {
        this.sentenceLinks.splice(index, 1);
      }
    }
    return this;
  }


  asJson() {

    const nodes = this.subNodes && this.subNodes.map(child => child.asJson());

    const result = {
      ruleID: this.ruleID,
      label: this.label,
      operation: this.operation,
      stipulation: this.stipulation,
      sentenceLinks: this.sentenceLinks,
      nodes
    };
    return result;
  }

}

export class LaDecisionRoot extends LaDecisionNode {
  constructor(properties?: any) {
    super(properties);
  }

  asJson() {
    return super.asJson();
  }

}

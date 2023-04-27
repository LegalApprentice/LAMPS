import { LaAtom } from '../shared/la-atom';
import { LaAttributionRelation } from './la-attributionRelation';

import { LaDecisionNode } from './la-decisionNode';
import { Toast, Tools } from '@app/shared';
import { LaUserTag, IUserTags, ITagsAndNotes, IGroupRef } from './la-tags';

export class EnrichmentPrediction {
  text: string;
  classification: string;
  predictions: any;
}

export class LaModelTags extends LaAtom {
  // public isType(name:string): boolean {
  //   return Tools.matches(`LaModelTags`,name);
  // }
  get myType(): string {
    return `LaModelTags`;
  }

  author: string;
  rhetClass: any;
  polarity: any;
  ruleID: any;

  constructor(properties?: any) {
    super(properties);
  }

  asStats(title: string) {
    let note = ""
    if (this.rhetClass) {
      note = `${note} ${this.rhetClass} `
    }
    if (this.polarity) {
      note = `${note} ${this.polarity} `
    }
    if (this.ruleID) {
      note = `${note} ${this.ruleID} `
    }

    if (note) {
      note = `${title} ${note} - (author ${this.author})`
    }
    return note;
  }
}



export class LaEnrichmentSet extends LaModelTags {
  rhetClass: EnrichmentPrediction;
  polarity: EnrichmentPrediction;
  ruleID: EnrichmentPrediction;

  constructor(properties?: any) {
    super(properties);
  }
}

export enum EditOp { Split, Join, Delete, Edit, InsertPara, InsertSent, Footnote, Tokenize, None }
export class LaSentence extends LaAtom implements ITagsAndNotes, IGroupRef {


  get myType(): string {
    return `LaSentence`;
  }

  groupIDs: string;
  sentID: string;
  paraID: string;
  text: string;

  isSection: boolean;
  private sectionType: string;
  isFirst: boolean;
  isLast: boolean;
  isBookmark: boolean;

  footnoteRefs: { [name: string]: string };

  renumId: number;
  caseNumber: string;
  paragraphNumber: string;
  sentenceNumber: string;
  unchangedSince: string;


  notes: string;
  userTags: Array<LaUserTag>
  isItemOfInterest: boolean;
  author: string;

  labels: LaModelTags;
  forecast: LaModelTags;
  probability: LaModelTags;
  enrichmentSet: LaEnrichmentSet;

  attributions: Array<LaAttributionRelation>;
  private ruleConditions: Array<string>;

  asJson() {
    const result = {
      sentID: this.sentID,
      caseNumber: this.caseNumber,
      sentenceNumber: this.sentenceNumber,
      paragraphNumber: this.paragraphNumber,
      text: this.text,
      author: this.author,
      groupIDs: this.groupIDs,
      unchangedSince: this.unchangedSince,
      isItemOfInterest: this.isItemOfInterest,
      isSection: this.isSection,
      sectionType: this.sectionType,
      isFirst: this.isFirst,
      isLast: this.isLast,
      notes: this.notes,
      userTags: this.userTags,
      footnoteRefs: this.footnoteRefs,
      labels: this.labels,
      forecast: this.forecast,
      probability: this.probability,
      enrichmentSet: this.enrichmentSet
    }

    return result;
  }



  public static sentenceRef(sent:LaSentence, id:number=undefined){
    const no = id ? id : (sent.sentenceNumber || 0)
    const key = `${sent.caseNumber}P${sent.paragraphNumber}S${no}`;
    return key;
  }

  constructor(properties?: any) {
    super(properties);

    //must override values set in super
    if (properties?.userTags) {
      this.userTags = new Array<LaUserTag>();
      properties?.userTags?.forEach(item => {
        const newTag = new LaUserTag(item)
        newTag.applyJSON(item);
        this.addUserTag(newTag)
      });
    }


    // const hasEnrichment = Tools.isEmpty(this.enrichmentSet) ? false : true

    if (properties?.rhetClass) {
      const rhetClass = properties.rhetClass;
      delete this['rhetClass'];
      if (!Tools.matches(rhetClass, 'Sentence')) {
        this.writeLabel('rhetClass', rhetClass, this.author)
      }
    }

    if (properties?.rhetClassPredict?.length > 0) {
      const rhetClass = properties.rhetClassPredict;
      delete this['rhetClassPredict'];
      this.writePrediction('rhetClass', rhetClass, this.author)
    }

    if (properties?.attributions?.length > 0) {
      const att = properties.attributions[0];
      const polarity = att.polarity;
      this.writeLabel('polarity', polarity, this.author)
    }

    if (properties?.ruleConditions?.length > 0) {
      let ruleID = properties.ruleConditions[0];
      ruleID = ruleID.replace('|', '_');
      ruleID = ruleID.replace('.', '-');
      this.writeLabel('ruleID', ruleID, this.author)
    }

    if (properties?.labels) {
      this.labels = new LaModelTags(properties.labels)
    }

    if (properties?.probability) {
      this.probability = new LaModelTags(properties.probability)
    }

    if (properties?.forecast) {
      this.forecast = new LaModelTags(properties.forecast)
    }


    if (Tools.isString(this.isSection)) {
      this.isSection = Tools.matches(String(this.isSection), 'false') ? false : true;
    }

    this.sentID && this.decomposeID(this.sentID);

    if (this.sentenceNumber) {
      this.renumId = parseInt(this.sentenceNumber);
    }

    const attributionData = this.attributions;
    if (attributionData && attributionData.length > 0) {
      this.attributions = [];
      attributionData.forEach(item => {
        const obj = new LaAttributionRelation();
        this.addAttributionRelation(obj);
        obj.override(item);
      });
    }

    if (properties?.predictions) {
      const pred = properties.predictions;
      if (pred.author) {
        this.forecast = new LaModelTags(pred)
      } else {
        this.enrichmentSet = pred;
      }
    }

    if (properties?.sectionType) {
      let reset = this.sectionType.replace('Section','');
      if ( reset.includes('unknown')) {
        reset = ''
      }
      this.sectionType = reset;
    }

    this.applyEnrichmentSet(this.enrichmentSet);
  }

  addGroupID(groupID: string): string {
    if (!this.groupIDs) {
      this.groupIDs = groupID
    } else if (!this.groupIDs.includes(groupID)) {
      this.groupIDs = `${this.groupIDs};${groupID}`
    }
    return groupID;
  }

  removeGroupID(groupID: string): string {
    if (this.groupIDs) {
      const split = this.groupIDs.split(';')
      const index = split.indexOf(groupID);
      if (index > -1) {
        split.splice(index, 1);
        this.groupIDs = split.join(';')
      }
    }
    return groupID;
  }

  clearGroupIDs() {
    this.groupIDs = null
  }

  MarkSectionAsDeleted() {
    this.SetSectionTypeAndStatus('DELETED',false)
  }

  toggleDeleted(){
    if ( this.IsDeleted()) {
      this.SetSectionTypeAndStatus('',false)
    } else {
      this.MarkSectionAsDeleted()
    }
  }

  IsEmptyOrDeleted() {
    if ( this.IsEmpty() ) {
      this.MarkSectionAsDeleted()
    }
    return this.IsDeleted();
  }

  IsEmpty() {
    return this.text.length == 0 ? true : false;
  }

  GetSectionType(): string {
    return this.sectionType;
  }
  IsDeleted() {
    return Tools.matches(this.sectionType, 'DELETED');
  }

  HasSection() {
    return !Tools.isEmpty(this.sectionType)
  }

  SetSectionTypeAndStatus(name: string, status:boolean) {
    this.sectionType = name;
    this.isSection = status;
    //if there is a footnote they should be set when the service is called

  }



  getGroupID(): string {
    return this.groupIDs || '';
  }

  compareGroupID(other: LaSentence): number {
    if (this.getGroupID() == other.getGroupID()) {
      return 0
    }
    return this.getGroupID() > other.getGroupID() ? 1 : -1;
  }

  toggleBookmark() {
    this.isBookmark = !this.isBookmark;
  }

  getSummary(): string {
    return this.text;
  }


  hasFootnoteReference(): boolean {
    return Tools.isNotEmpty(this.footnoteRefs);
  }



  createTagDisplayRecord() {
    const item = this;
    const data = {
      object: item,
      objectID: item.sentID,
      rhetClass: item.getRhetClass(),
      caseNumber: item.caseNumber,
      paragraphNumber: item.paragraphNumber,
      sentenceNumber: item.sentenceNumber,
      notes: item.notes,
      text: item.text
    };
    return data;
  }

  isImmutable(): boolean {
    return !Tools.isEmpty(this.unchangedSince);
  }

  showImmutable(): string {
    if (this.isImmutable()) {
      return this.unchangedSince;
    }
    return '';
  }

  markAsImmutable() {
    this.isItemOfInterest = false;
    this.unchangedSince = Tools.getNowIsoDate();
    return this;
  }

  writeProbability(category: string, value: any, author: string = ''): string {
    if (this.isSection) return;
    if (!this.probability) {
      this.probability = new LaModelTags({ author: author })
    }
    this.probability[category] = value;
    return value;
  }

  writeLabel(category: string, label: string, author: string): string {
    if (this.isSection) return;
    if (!this.labels) {
      this.labels = new LaModelTags({ author: author })
    }
    this.labels[category] = label;
    return label;
  }

  writePrediction(category: string, label: string, author: string): string {
    if (this.isSection) return;
    if (!this.forecast) {
      this.forecast = new LaModelTags({ author: author })
    }
    this.forecast[category] = label;
    //console.info(label)
    return label;
  }

  applyEnrichmentSet(set: LaEnrichmentSet) {
    try {
      Tools.applyOverKeyValue(set, (key, value) => {
        if (value && value.classification && value.predictions) {
          this.writePrediction(key, value.classification, 'enriched');
          const data = value.predictions[value.classification]
          const prop = Tools.formatPrediction(data)
          this.writeProbability(key, prop, 'enriched')
        }
      })
    } catch (ex) {
      Toast.error(ex.message)
    }
  }

  readProbabilityValue(prop: string = "rhetClass"): number {
    const value = this.probability?.[prop] || 0;
    return value;
  }

  compareProbability(other: LaSentence): number {
    let valueA = this.readProbabilityValue()
    let valueB = other.readProbabilityValue()

    return valueA - valueB
  }

  readProbability(): string {
    const value = this.readProbabilityValue()
    if (value === 0.0) {
      return "Label"
    }
    else if (this.labels?.rhetClass) {
      return `L: ${value} %`
    }

    return `(${value}) %`
  }

  readRhetClass(): string {
    let result = this.labels?.rhetClass
    if (result) {
      return result;
    }
    result = this.forecast?.rhetClass
    if (result) {
      return result;
    }
    return 'Sentence';
  }

  getRhetClass(): string {
    if (this.isSection) {
      return 'section';
    }
    return this.readRhetClass();
  }


  hasLabeledClass(classification: string): boolean {
    return this.labels?.rhetClass === classification;
  }

  hasPredictedClass(classification: string): boolean {
    return this.forecast?.rhetClass === classification;
  }

  hasNoPrediction(): boolean {
    return this.forecast || this.labels ? true: false;
  }

  readPolarity(): string {
    let result = this.labels?.polarity
    if (result) {
      return result;
    }
    result = this.forecast?.polarity
    if (result) {
      return result;
    }
    return 'undecided';
  }

  polarityColor() {
    const result = this.readPolarity();
    try {
      if (Tools.matches(result, 'positive')) {
        return `rgba(0,255,0,0.7)`;
      } else if (Tools.matches(result, 'negative')) {
        return `rgba(255,0,0,0.7)`;
      } else if (Tools.matches(result, 'neutral')) {
        return 'white'
      } else if (Tools.matches(result, 'undecided')) {
        return 'black'
      }
      return `blue`;
    } catch (ex) {
      return `blue`;
    }
  }

  getSectionBadges() {
    const list: Array<any> = new Array<any>();

    if (this.sectionType) {
      list.push(this.sectionType);
    } else if ( this.isFirst ) {
      list.push('No Section Assignment')
    }
    return list;
  }





  compare(other: LaSentence): number {
    var root = parseInt(this.paragraphNumber)
    var score = parseInt(other.paragraphNumber) - root;
    if (score == 0) {
      var sent = parseInt(this.sentenceNumber);
      var diff = parseInt(other.sentenceNumber) - sent;
      score = root * diff / Math.abs(diff) + diff / 100;

    }
    return score;
  }

  //should be a table or grid in the future
  modelStatsToolTips(): string {
    const labels = this.labels?.asStats('Label:') || ""
    const forecast = this.forecast?.asStats('Forecast:') || ""
    return `<i>${labels}&nbsp;&nbsp;&nbsp;${forecast}</i>`
  }


  get label() {
    return this.paraTag();
  }

  computeID(): LaSentence {
    this.sentID = `${this.caseNumber}${this.paraTag()}${this.sentIDTag()}`;
    this.paraID = `${this.caseNumber}${this.paraTag()}`;
    return this;
  }

  decomposeID(sentID: string): LaSentence {
    let data = sentID.split('P');
    if ( data.length == 1 ) {
      data = sentID.split('FN');
    }
    this.caseNumber = data[0];

    data = data[1].split('S');
    this.paragraphNumber = data[0];
    this.sentenceNumber = data[1];
    return this;
  }
  
  immutableSentTag(): string {
    if (this.isImmutable()) {
      return `${this.unchangedSince}: ${this.paraTag()} ${this.sentIDTag()}`;
    }
    return `${this.paraTag()} ${this.sentIDTag()}`;
  }


  anchorTag(): string {
    return `${this.caseNumber}${this.paraTag()}${this.sentIDTag()}`;
  }

  paraTag(): string {
    const root = Tools.startsWith(this.sectionType,'FN') ? 'FN' : 'P';
    return `${root}${this.paragraphNumber || 0}`;
  }

  sentIDTag(): string {
    return `S${this.sentenceNumber || 0}`;
  }

  paraIDTag(): string {
    return `${this.caseNumber}${this.paraTag()}`;
  }

  sentTag(): string {
    return `${this.paraTag()}: ${this.sentIDTag()}`;
  }

  fullSentTag(): string {
    return `${this.caseNumber} ${this.sentTag()}`;
  }

  addUserTag(tag: LaUserTag): LaUserTag {
    if (!this.userTags) {
      this.userTags = new Array<LaUserTag>()
    }
    this.userTags.push(tag)
    return tag;
  }

  removeUserTag(tag: LaUserTag): LaUserTag {
    if (this.userTags) {
      const index = this.userTags.indexOf(tag)
      if (index > -1) {
        this.userTags.splice(index, 1);
      }
    }
    return tag;
  }

  renumberTo(num: number): LaSentence {
    this.renumId = num;
    this.sentenceNumber = num.toString();
    return this.computeID();
  }


  isUnclassified(): boolean {
    return !this.readRhetClass() || this.readRhetClass() === 'Sentence';
  }

  hasClassification(): boolean {
    return this.readRhetClass() && this.readRhetClass() !== 'Sentence';
  }

  //https://www.toptal.com/designers/htmlarrows/symbols/

  cutHere(first: string, rest:string): string {
    //const cut = `<button tooltip="add tags to items" (click)="doToggleTags()" type="button" class="btn btn-badge">add tags<mat-icon>local_offer</mat-icon></button>`
    //const cut = `<mat-icon>local_offer</mat-icon>`
    const cut = '&nbsp;&nbsp;&#x2704;&nbsp;&nbsp;'  //&#10573;
    //const xxx = `&nbsp;&#9887;&#9886;&nbsp;`
   return `${first}${cut}${rest}`;
  }

  bold(name: string): string {
    return `<b>${name}</b>`;
  }

  underline_simple(name: string): string {
    return `<ins>${name}</ins>`;
  }

  italic_simple(name: string): string {
    return `<i>${name}</i>`;
  }

  public superscriptNumbers(text: string): string {
    let result = ''

    for (var i = 0; i < text.length; i++) {
      switch (text[i]) {
        case '0':
          result += '⁰'; break;
        case '1':
          result += '¹'; break;
        case '2':
          result += '²'; break;
        case '3':
          result += '³'; break;
        case '4':
          result += '⁴'; break;
        case '5':
          result += '⁵'; break;
        case '6':
          result += '⁶'; break;
        case '7':
          result += '⁷'; break;
        case '8':
          result += '⁸'; break;
        case '9':
          result += '⁹'; break;
        default:
          break;
      }
    }

    return result;
  }

  hideFootnoteKeys(text: string, key: string): string {

    // const supOpen = `<span style="opacity:0;">`
    // const supClose = `</span>`

    // text = text.replace('{{',supOpen)
    // text = text.replace('}}',supClose)

    text = text.replace(`{{${key}}}`, ` ${this.superscriptNumbers(key)}`)
    return text;
  }

  itemOfInterestMarkup(text: string): string {
    return `<u class="item-of-interest-style" > ${text} </u>`;
  }

  deletedItemMarkup(text: string): string {
    return `<u class="deleted-item-style" > ${text} </u>`;
  }

  postEditMarkup(text: string): string {
    return `<u class="post-edit-style" > ${text} </u>`;
  }


  replaceBold(text: string, name: string): string {
    return text.replace(name, this.bold(name));
  }

  textMarkup(isOfInterest: boolean): string {
    let text = `${this.text}`

    if (isOfInterest) {
      text = this.itemOfInterestMarkup(text);
    }
    else if (this.IsDeleted()) {
      text = this.deletedItemMarkup(text);
    }

    if (this.isSection) {
      text = this.bold(text);
    }

    return `&nbsp; &nbsp; ${text}`;
  }

  //https://stackoverflow.com/questions/11761563/javascript-regexp-for-splitting-text-into-sentences-and-keeping-the-delimiter
  quickSplitMarkup(isOfInterest: boolean): string {
    let text = `${this.text}`

    if (isOfInterest) {
      text = this.itemOfInterestMarkup(text);
    }

    // var result = this.quickSplitArray(text)
    // if ( result.length > 1 ) {
    //   const cut = '&nbsp;&nbsp;&#x2704;&nbsp;&nbsp;'  
    //   text = result.join(cut);
    // }

    return `&nbsp; &nbsp; ${text}`;
  }



  quickSplitArray(text:string){

    //const splitter = new RegExp('(?<=[^A-Z].[.?]) +(?=[A-Z])', 'g');
    //const list = text.split(splitter);

    //var result = text.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
    // var result = text.match( /[^\.!\?]+[\.!\?]+/g );

    //var result = text.split(/[^.?!]+[.!?]+[\])'"`’”]*/g);

    //var result = text.split(/. [A-Z]*/g)
    var result = text.split(/(.+?([A-Z].)\.(?:['")\\\s][\"]?)+?\s?)/igm);

    var result = text.split(/(?<=[^A-Z].[.?]) +(?=[A-Z])*/g);
    return result;
  }

  modifyFootnoteRefs() {
    const list = this.text.split('{{')
    const key = list[1].split('}}')[0]

    if (key) {
      this.footnoteRefs[key] = `FN${key}`
      this.text = this.hideFootnoteKeys(this.text, key);
      //console.log(this.text)
    }
  }

  modifyTextAndHideFootnotes() {
    if (this.footnoteRefs) {
      Object.keys(this.footnoteRefs).forEach(key => {
        this.text = this.hideFootnoteKeys(this.text, key);
      })
    }
    //did we miss any footnotes
    const found = this.text.indexOf('{{')
    if (found != -1) {
      this.modifyFootnoteRefs()
    }
  }

  hasEnrichmentSet(): boolean {
    return this.enrichmentSet !== undefined;
  }


  displayForecasts() {
    return [];
  }

  isFindingSentence(): boolean {
    try {
      const result = this.readRhetClass();
      return result?.includes('Finding');
    } catch (ex) {
      Toast.error(ex.message)
      const xx = this.readRhetClass();
      return false
    }
  }




  getFindingAttribution(): LaAttributionRelation {
    if (this.hasAttributionRelation()) {
      const result = this.attributions.filter(x => x.type.includes('Finding'));
      return result && result[0];
    }
  }

  hasAttributionRelation(): boolean {
    return this.attributions && this.attributions.length > 0;
  }

  getCurrentAttributionRelation(): LaAttributionRelation {
    return this.attributions && this.attributions[0];
  }

  addAttributionRelation(obj: LaAttributionRelation): LaSentence {
    if (!this.hasAttributionRelation()) {
      this.attributions = new Array<LaAttributionRelation>();
    }
    this.attributions.push(obj);
    return this;
  }

  removeAttributionRelation(obj: LaAttributionRelation): LaSentence {
    if (!this.hasAttributionRelation()) {
      return;
    }
    const index = this.attributions.indexOf(obj);
    if (index > -1) {
      this.attributions.splice(index, 1);
    }
    return this;
  }

  isLikelyCitation(): boolean {
    if (this.getRhetClass().includes('Citation')) {
      return true;
    }
    return false;
  }

  mergeTextFromSentence(sentence: LaSentence, extra: string = ' ') {
    this.text += `${extra}${sentence.text}`;
    return this;
  }


  hasDecision(decision: LaDecisionNode): boolean {
    return this.hasDecisionRuleID(decision.ruleID);
  }


  hasDecisionRuleID(key: string): boolean {
    if (this.ruleConditions) {
      const index = this.ruleConditions.indexOf(key);
      return index >= 0;
    }
    return false;
  }

  getDecisionKeys(): Array<string> {
    if (!this.ruleConditions) {
      return new Array<string>();
    }
    return this.ruleConditions;
  }

  addDecision(decision: LaDecisionNode): LaSentence {
    this.addDecisionRuleID(decision.ruleID);
    return this;
  }

  removeDecision(decision: LaDecisionNode): LaSentence {
    this.removeDecisionRuleID(decision.ruleID);
    return this;
  }

  addDecisionRuleID(key: string): LaSentence {
    if (!this.ruleConditions) {
      this.ruleConditions = new Array<string>();
    }

    const index = this.ruleConditions.indexOf(key);
    if (index === -1) {
      this.ruleConditions.push(key);
    }
    return this;
  }

  removeDecisionRuleID(key: string): LaSentence {
    if (this.ruleConditions) {
      const index = this.ruleConditions.indexOf(key);
      if (index > -1) {
        this.ruleConditions.splice(index, 1);
      }
    }
    return this;
  }

}
